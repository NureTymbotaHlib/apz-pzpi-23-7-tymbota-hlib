package com.nure.autoinsurancemobile.screens

import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import com.nure.autoinsurancemobile.MainActivity
import com.nure.autoinsurancemobile.data.Policy
import com.nure.autoinsurancemobile.navigation.AppScreen
import com.nure.autoinsurancemobile.ui.addButtonWithMargin
import com.nure.autoinsurancemobile.ui.addCard
import com.nure.autoinsurancemobile.ui.badge
import com.nure.autoinsurancemobile.ui.bodyText
import com.nure.autoinsurancemobile.ui.dp
import com.nure.autoinsurancemobile.ui.fieldRow
import com.nure.autoinsurancemobile.ui.metricCard
import com.nure.autoinsurancemobile.ui.page
import com.nure.autoinsurancemobile.ui.primaryButton
import com.nure.autoinsurancemobile.ui.secondaryButton
import com.nure.autoinsurancemobile.ui.space
import com.nure.autoinsurancemobile.ui.titleText

class HomeScreen {

    fun create(activity: MainActivity): View {
        val initial = render(activity, null, "Перевірка...")
        load(activity)
        return initial
    }

    private fun load(activity: MainActivity) {
        activity.runOnBackground {
            val health = activity.api.get("/api/health")
            val policyResponse = activity.api.get("/api/policies/1")
            val policy = if (policyResponse.isSuccessful) {
                try { Policy.fromJson(policyResponse.body) } catch (_: Exception) { null }
            } else null

            activity.runOnUiThread {
                val serverStatus = if (health.isSuccessful) "Сервер активний" else "Сервер недоступний"
                activity.setPage(render(activity, policy, serverStatus))
            }
        }
    }

    private fun roleActionTitle(role: MainActivity.UserRole): String = when (role) {
        MainActivity.UserRole.DRIVER -> "Швидкі дії водія"
        MainActivity.UserRole.AGENT -> "Дії страхового агента"
        MainActivity.UserRole.MANAGER -> "Дії менеджера"
        MainActivity.UserRole.ADMIN -> "Адміністрування"
    }

    private fun render(activity: MainActivity, policy: Policy?, serverStatus: String): View {
        return page(
            activity,
            "AutoInsurance",
            activity.selectedRole.description
        ) {
            addCard(activity) {
                addView(titleText(activity, "Поточний режим"))
                addView(fieldRow(activity, "Роль", activity.selectedRole.title))
                addView(fieldRow(activity, "Backend", serverStatus))
                addButtonWithMargin(secondaryButton(activity, "Змінити роль") {
                    activity.navigate(AppScreen.Profile)
                }, activity)
            }

            addCard(activity) {
                addView(titleText(activity, "Активний поліс"))
                if (policy == null) {
                    addView(fieldRow(activity, "Статус", "не завантажено"))
                } else {
                    addView(fieldRow(activity, "Номер", policy.number))
                    addView(fieldRow(activity, "Статус", policy.status))
                    addView(fieldRow(activity, "Тип", policy.type))
                    addView(fieldRow(activity, "Період", "${policy.startDate} — ${policy.endDate}"))
                }
                addButtonWithMargin(primaryButton(activity, "Відкрити поліс") {
                    activity.navigate(AppScreen.Policy)
                }, activity)
            }

            val metrics = LinearLayout(activity).apply { orientation = LinearLayout.HORIZONTAL }
            metrics.addView(metricCard(activity, "Safety score", "87"), LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply {
                setMargins(0, 0, activity.dp(6), 0)
            })
            metrics.addView(metricCard(activity, "Подій", "12"), LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply {
                setMargins(activity.dp(6), 0, 0, 0)
            })
            addView(metrics)
            addView(space(activity, 12))

            addCard(activity) {
                addView(titleText(activity, roleActionTitle(activity.selectedRole)))
                when (activity.selectedRole) {
                    MainActivity.UserRole.DRIVER -> {
                        addButtonWithMargin(secondaryButton(activity, "Моє авто") { activity.navigate(AppScreen.Vehicle) }, activity)
                        addButtonWithMargin(secondaryButton(activity, "Телеметрія") { activity.navigate(AppScreen.Telemetry) }, activity)
                        addButtonWithMargin(secondaryButton(activity, "Заявка про ДТП") { activity.navigate(AppScreen.Claims) }, activity)
                    }
                    MainActivity.UserRole.AGENT -> {
                        addButtonWithMargin(secondaryButton(activity, "Дані поліса") { activity.navigate(AppScreen.Policy) }, activity)
                        addButtonWithMargin(secondaryButton(activity, "Дані авто клієнта") { activity.navigate(AppScreen.Vehicle) }, activity)
                    }
                    MainActivity.UserRole.MANAGER -> {
                        addButtonWithMargin(secondaryButton(activity, "Страхові випадки") { activity.navigate(AppScreen.Claims) }, activity)
                        addButtonWithMargin(secondaryButton(activity, "Телеметрія ДТП") { activity.navigate(AppScreen.Telemetry) }, activity)
                    }
                    MainActivity.UserRole.ADMIN -> {
                        addButtonWithMargin(secondaryButton(activity, "Перевірка API") { activity.navigate(AppScreen.Telemetry) }, activity)
                        addButtonWithMargin(secondaryButton(activity, "Профіль та доступ") { activity.navigate(AppScreen.Profile) }, activity)
                    }
                }
            }
        }
    }
}
