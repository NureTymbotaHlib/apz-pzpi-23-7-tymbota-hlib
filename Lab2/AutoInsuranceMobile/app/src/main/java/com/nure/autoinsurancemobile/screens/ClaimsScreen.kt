package com.nure.autoinsurancemobile.screens

import android.view.View
import com.nure.autoinsurancemobile.MainActivity
import com.nure.autoinsurancemobile.data.ClaimItem
import com.nure.autoinsurancemobile.data.ClaimWorkflow
import com.nure.autoinsurancemobile.navigation.AppScreen
import com.nure.autoinsurancemobile.ui.addButtonWithMargin
import com.nure.autoinsurancemobile.ui.addCard
import com.nure.autoinsurancemobile.ui.badge
import com.nure.autoinsurancemobile.ui.bodyText
import com.nure.autoinsurancemobile.ui.fieldRow
import com.nure.autoinsurancemobile.ui.page
import com.nure.autoinsurancemobile.ui.primaryButton
import com.nure.autoinsurancemobile.ui.secondaryButton
import com.nure.autoinsurancemobile.ui.space
import com.nure.autoinsurancemobile.ui.titleText
import org.json.JSONObject

class ClaimsScreen {

    private var selectedClaimId: Int? = null
    private var lastInfoMessage: String? = null

    fun create(activity: MainActivity): View {
        return renderList(activity)
    }

    private fun claimsForRole(activity: MainActivity): List<ClaimItem> {
        val all = activity.claimStore.all()
        return when (activity.selectedRole) {
            MainActivity.UserRole.DRIVER -> all.filter { it.clientId == 1 }
            MainActivity.UserRole.AGENT -> all.filter { it.policyId == 1 }
            MainActivity.UserRole.MANAGER -> all.filter { it.status != ClaimWorkflow.PAID || it.assignedManager != null }
            MainActivity.UserRole.ADMIN -> all
        }
    }

    private fun renderList(activity: MainActivity): View {
        val claims = claimsForRole(activity)
        val subtitle = when (activity.selectedRole) {
            MainActivity.UserRole.DRIVER -> "Мої подані страхові випадки"
            MainActivity.UserRole.AGENT -> "Заявки клієнта за полісом"
            MainActivity.UserRole.MANAGER -> "Черга на розгляд і рішення"
            MainActivity.UserRole.ADMIN -> "Контроль усіх заявок"
        }

        return page(activity, "Заявки", subtitle) {
            addCard(activity) {
                addView(titleText(activity, "Режим: ${activity.selectedRole.title}"))
                addView(bodyText(activity, roleHint(activity.selectedRole)))
                if (lastInfoMessage != null) addView(badge(activity, lastInfoMessage!!, true))

                if (activity.selectedRole == MainActivity.UserRole.DRIVER) {
                    addButtonWithMargin(primaryButton(activity, "Подати нову заявку") {
                        submitClaim(activity)
                    }, activity)
                }
                if (activity.selectedRole == MainActivity.UserRole.ADMIN) {
                    addButtonWithMargin(secondaryButton(activity, "Скинути демо-дані заявок") {
                        activity.claimStore.resetDemo()
                        lastInfoMessage = "Демо-дані оновлено"
                        activity.setPage(renderList(activity))
                    }, activity)
                }
            }

            if (claims.isEmpty()) {
                addCard(activity) {
                    addView(titleText(activity, "Заявок немає"))
                    addView(bodyText(activity, "Для цієї ролі немає доступних страхових випадків."))
                }
            } else {
                claims.forEach { claim ->
                    addClaimListCard(activity, claim)
                }
            }
        }
    }

    private fun android.widget.LinearLayout.addClaimListCard(activity: MainActivity, claim: ClaimItem) {
        addCard(activity) {
            addView(titleText(activity, claim.title, 20f))
            addView(badge(activity, ClaimWorkflow.ua(claim.status), ClaimWorkflow.isPositive(claim.status)))
            addView(fieldRow(activity, "Дата події", claim.eventTime))
            addView(fieldRow(activity, "Оцінка збитку", "${claim.estimatedDamage} грн"))
            addView(fieldRow(activity, "Менеджер", claim.assignedManager ?: "не призначено"))
            addButtonWithMargin(secondaryButton(activity, "Відкрити заявку") {
                selectedClaimId = claim.localId
                activity.setPage(renderDetails(activity, claim.localId))
            }, activity)
        }
    }

    private fun renderDetails(activity: MainActivity, claimId: Int): View {
        val claim = activity.claimStore.all().firstOrNull { it.localId == claimId }
            ?: return renderList(activity)

        return page(activity, claim.title, "Картка страхового випадку") {
            addCard(activity) {
                addView(titleText(activity, "Стан заявки", 20f))
                addView(badge(activity, ClaimWorkflow.ua(claim.status), ClaimWorkflow.isPositive(claim.status)))
                addView(fieldRow(activity, "Локальний ID", "#${claim.localId}"))
                addView(fieldRow(activity, "Server ID", claim.serverId?.let { "#$it" } ?: "немає"))
                addView(fieldRow(activity, "Поліс", "#${claim.policyId}"))
                addView(fieldRow(activity, "Клієнт", "#${claim.clientId}"))
                addView(fieldRow(activity, "Дата події", claim.eventTime))
                addView(fieldRow(activity, "Локація", claim.location))
                addView(fieldRow(activity, "Оцінка збитку", "${claim.estimatedDamage} грн"))
                addView(fieldRow(activity, "Погоджена виплата", claim.approvedPayout?.let { "$it грн" } ?: "—"))
                addView(fieldRow(activity, "Менеджер", claim.assignedManager ?: "не призначено"))
                addView(space(activity, 8))
                addView(bodyText(activity, claim.description))
                if (claim.note.isNotBlank()) addView(bodyText(activity, "Примітка: ${claim.note}"))
            }

            addCard(activity) {
                addView(titleText(activity, "Дії"))
                addActionsForRole(activity, claim)
                addButtonWithMargin(secondaryButton(activity, "Повернутися до списку") {
                    selectedClaimId = null
                    activity.setPage(renderList(activity))
                }, activity)
            }
        }
    }

    private fun android.widget.LinearLayout.addActionsForRole(activity: MainActivity, claim: ClaimItem) {
        when (activity.selectedRole) {
            MainActivity.UserRole.DRIVER -> {
                addView(bodyText(activity, "Водій може подати заявку та відстежувати її стан."))
                if (claim.status == ClaimWorkflow.CREATED) {
                    addButtonWithMargin(secondaryButton(activity, "Скасувати чернетку локально") {
                        updateClaim(activity, claim.localId) {
                            it.copy(status = ClaimWorkflow.REJECTED, note = "Заявку скасовано водієм у мобільному застосунку")
                        }
                    }, activity)
                }
            }

            MainActivity.UserRole.AGENT -> {
                addView(bodyText(activity, "Агент бачить заявки клієнта та може передати їх менеджеру."))
                if (claim.status == ClaimWorkflow.CREATED) {
                    addButtonWithMargin(primaryButton(activity, "Передати менеджеру") {
                        updateClaim(activity, claim.localId) {
                            it.copy(note = "Агент перевірив дані поліса та передав заявку менеджеру")
                        }
                    }, activity)
                }
                addButtonWithMargin(secondaryButton(activity, "Відкрити поліс клієнта") {
                    activity.navigate(AppScreen.Policy)
                }, activity)
            }

            MainActivity.UserRole.MANAGER -> {
                addView(bodyText(activity, "Менеджер реєструє заявку, приймає рішення та позначає виплату."))
                if (claim.status == ClaimWorkflow.CREATED) {
                    addButtonWithMargin(primaryButton(activity, "Взяти в роботу") {
                        updateClaim(activity, claim.localId) {
                            it.copy(
                                status = ClaimWorkflow.IN_REVIEW,
                                assignedManager = "Manager #2",
                                note = "Заявку зареєстровано менеджером"
                            )
                        }
                    }, activity)
                }
                if (claim.status == ClaimWorkflow.IN_REVIEW) {
                    addButtonWithMargin(primaryButton(activity, "Схвалити виплату") {
                        updateClaim(activity, claim.localId) {
                            val payout = (it.estimatedDamage * 0.85).toInt()
                            it.copy(
                                status = ClaimWorkflow.APPROVED,
                                approvedPayout = payout,
                                note = "Менеджер схвалив виплату після перевірки телеметрії"
                            )
                        }
                    }, activity)
                    addButtonWithMargin(secondaryButton(activity, "Відхилити заявку") {
                        updateClaim(activity, claim.localId) {
                            it.copy(
                                status = ClaimWorkflow.REJECTED,
                                approvedPayout = null,
                                note = "Менеджер відхилив заявку після перевірки обставин"
                            )
                        }
                    }, activity)
                }
                if (claim.status == ClaimWorkflow.APPROVED) {
                    addButtonWithMargin(primaryButton(activity, "Позначити як виплачено") {
                        updateClaim(activity, claim.localId) {
                            it.copy(status = ClaimWorkflow.PAID, note = "Виплату виконано")
                        }
                    }, activity)
                }
                addButtonWithMargin(secondaryButton(activity, "Переглянути телеметрію") {
                    activity.navigate(AppScreen.Telemetry)
                }, activity)
            }

            MainActivity.UserRole.ADMIN -> {
                addView(bodyText(activity, "Адміністратор контролює процес і може вручну змінити стан демо-заявки."))
                addButtonWithMargin(secondaryButton(activity, "Повернути у статус Подано") {
                    updateClaim(activity, claim.localId) {
                        it.copy(status = ClaimWorkflow.CREATED, assignedManager = null, approvedPayout = null, note = "Статус змінено адміністратором")
                    }
                }, activity)
                addButtonWithMargin(secondaryButton(activity, "Призначити менеджера") {
                    updateClaim(activity, claim.localId) {
                        it.copy(status = ClaimWorkflow.IN_REVIEW, assignedManager = "Manager #2", note = "Менеджера призначено адміністратором")
                    }
                }, activity)
            }
        }
    }

    private fun submitClaim(activity: MainActivity) {
        activity.showLoading("Створення заявки...")
        activity.runOnBackground {
            val response = activity.api.post("/api/claims", activity.api.createClaimPayload())
            val serverId = if (response.isSuccessful) {
                try { JSONObject(response.body).optInt("claim_id") } catch (_: Exception) { null }
            } else null

            activity.runOnUiThread {
                val created = activity.claimStore.createFromDriver(serverId)
                lastInfoMessage = if (serverId != null && serverId > 0) {
                    "Заявку #${created.localId} створено і синхронізовано з API"
                } else {
                    "Заявку #${created.localId} створено локально"
                }
                selectedClaimId = created.localId
                activity.setPage(renderDetails(activity, created.localId))
            }
        }
    }

    private fun updateClaim(activity: MainActivity, claimId: Int, transform: (ClaimItem) -> ClaimItem) {
        val updated = activity.claimStore.update(claimId, transform)
        lastInfoMessage = "Заявку оновлено"
        if (updated != null) {
            activity.setPage(renderDetails(activity, updated.localId))
        } else {
            activity.setPage(renderList(activity))
        }
    }

    private fun roleHint(role: MainActivity.UserRole): String = when (role) {
        MainActivity.UserRole.DRIVER -> "Водій працює тільки зі своїми страховими випадками."
        MainActivity.UserRole.AGENT -> "Агент переглядає заявки клієнта в межах поліса."
        MainActivity.UserRole.MANAGER -> "Менеджер обробляє заявки: бере в роботу, схвалює або відхиляє."
        MainActivity.UserRole.ADMIN -> "Адміністратор бачить усі заявки та керує демо-станами."
    }
}
