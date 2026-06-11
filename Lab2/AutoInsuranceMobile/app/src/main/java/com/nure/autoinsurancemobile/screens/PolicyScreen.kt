package com.nure.autoinsurancemobile.screens

import android.view.View
import com.nure.autoinsurancemobile.MainActivity
import com.nure.autoinsurancemobile.data.Policy
import com.nure.autoinsurancemobile.navigation.AppScreen
import com.nure.autoinsurancemobile.ui.addButtonWithMargin
import com.nure.autoinsurancemobile.ui.addCard
import com.nure.autoinsurancemobile.ui.badge
import com.nure.autoinsurancemobile.ui.bodyText
import com.nure.autoinsurancemobile.ui.errorPage
import com.nure.autoinsurancemobile.ui.fieldRow
import com.nure.autoinsurancemobile.ui.page
import com.nure.autoinsurancemobile.ui.primaryButton
import com.nure.autoinsurancemobile.ui.secondaryButton
import com.nure.autoinsurancemobile.ui.titleText

class PolicyScreen {

    fun create(activity: MainActivity): View {
        activity.runOnBackground {
            val response = activity.api.get("/api/policies/1")
            activity.runOnUiThread {
                if (response.isSuccessful) {
                    try {
                        activity.setPage(render(activity, Policy.fromJson(response.body)))
                    } catch (e: Exception) {
                        activity.setPage(errorPage(activity, "Поліс", e.message ?: "Помилка обробки відповіді") {
                            activity.navigate(AppScreen.Policy)
                        })
                    }
                } else {
                    activity.setPage(errorPage(activity, "Поліс", response.error ?: "HTTP ${response.code}") {
                        activity.navigate(AppScreen.Policy)
                    })
                }
            }
        }
        return com.nure.autoinsurancemobile.ui.loadingView(activity, "Завантаження поліса...")
    }

    private fun render(activity: MainActivity, policy: Policy): View {
        return page(activity, "Страховий поліс", "Деталі договору") {
            addCard(activity) {
                addView(titleText(activity, policy.number, 22f))
                addView(badge(activity, policy.status, policy.status.equals("Active", true)))
                addView(bodyText(activity, "Тип страхування: ${policy.type}"))
            }

            addCard(activity) {
                addView(titleText(activity, "Основна інформація"))
                addView(fieldRow(activity, "ID поліса", policy.id.toString()))
                addView(fieldRow(activity, "Клієнт", "#${policy.clientId}"))
                addView(fieldRow(activity, "Авто", "#${policy.vehicleId}"))
                addView(fieldRow(activity, "Тариф", policy.tariffPlan))
                addView(fieldRow(activity, "Початок", policy.startDate))
                addView(fieldRow(activity, "Завершення", policy.endDate))
            }

            addCard(activity) {
                addView(titleText(activity, "Фінанси"))
                addView(fieldRow(activity, "Базова премія", policy.basePremium))
                addView(fieldRow(activity, "Фінальна премія", policy.finalPremium))
                addButtonWithMargin(primaryButton(activity, "Перейти до авто") {
                    activity.navigate(AppScreen.Vehicle)
                }, activity)
                addButtonWithMargin(secondaryButton(activity, "Оформити заявку про ДТП") {
                    activity.navigate(AppScreen.Claims)
                }, activity)
            }
        }
    }
}
