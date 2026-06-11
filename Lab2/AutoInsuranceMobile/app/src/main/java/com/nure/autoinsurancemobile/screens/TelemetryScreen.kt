package com.nure.autoinsurancemobile.screens

import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import com.nure.autoinsurancemobile.MainActivity
import com.nure.autoinsurancemobile.data.TelemetryEvent
import com.nure.autoinsurancemobile.navigation.AppScreen
import com.nure.autoinsurancemobile.ui.AppTheme
import com.nure.autoinsurancemobile.ui.addButtonWithMargin
import com.nure.autoinsurancemobile.ui.addCard
import com.nure.autoinsurancemobile.ui.badge
import com.nure.autoinsurancemobile.ui.bodyText
import com.nure.autoinsurancemobile.ui.errorPage
import com.nure.autoinsurancemobile.ui.fieldRow
import com.nure.autoinsurancemobile.ui.loadingView
import com.nure.autoinsurancemobile.ui.page
import com.nure.autoinsurancemobile.ui.primaryButton
import com.nure.autoinsurancemobile.ui.secondaryButton
import com.nure.autoinsurancemobile.ui.titleText

class TelemetryScreen {

    fun create(activity: MainActivity): View {
        load(activity)
        return loadingView(activity, "Завантаження телеметрії...")
    }

    private fun load(activity: MainActivity) {
        activity.runOnBackground {
            val response = activity.api.get("/api/telemetry-events?vehicleId=1")
            activity.runOnUiThread {
                if (response.isSuccessful) {
                    try {
                        activity.setPage(render(activity, TelemetryEvent.listFromJson(response.body), null))
                    } catch (e: Exception) {
                        activity.setPage(errorPage(activity, "Телеметрія", e.message ?: "Помилка обробки відповіді") {
                            activity.navigate(AppScreen.Telemetry)
                        })
                    }
                } else {
                    activity.setPage(render(activity, emptyList(), response.error ?: "HTTP ${response.code}"))
                }
            }
        }
    }

    private fun sendTelemetry(activity: MainActivity) {
        activity.showLoading("Надсилання телеметрії...")
        activity.runOnBackground {
            val response = activity.api.post("/api/telemetry-events", activity.api.createTelemetryPayload())
            val message = if (response.isSuccessful) "Нову телеметричну подію успішно створено" else response.error ?: "HTTP ${response.code}"
            val listResponse = activity.api.get("/api/telemetry-events?vehicleId=1")
            val events = if (listResponse.isSuccessful) {
                try { TelemetryEvent.listFromJson(listResponse.body) } catch (_: Exception) { emptyList() }
            } else emptyList()

            activity.runOnUiThread {
                activity.setPage(render(activity, events, message))
            }
        }
    }

    private fun render(activity: MainActivity, events: List<TelemetryEvent>, message: String?): View {
        return page(activity, "Телеметрія", "Моніторинг подій автомобіля") {
            addCard(activity) {
                addView(titleText(activity, "Дії з телеметрією"))
                if (message != null && !message.contains("HTTP") && !message.contains("Помилка")) {
                    addView(badge(activity, message, true))
                }
                addButtonWithMargin(primaryButton(activity, "Надіслати тестову подію") {
                    sendTelemetry(activity)
                }, activity)
                addButtonWithMargin(secondaryButton(activity, "Оновити список") {
                    activity.navigate(AppScreen.Telemetry)
                }, activity)
            }

            if (events.isEmpty()) {
                addCard(activity) {
                    addView(titleText(activity, "Подій поки немає"))
                }
            } else {
                events.take(8).forEach { event ->
                    addCard(activity) {
                        val header = LinearLayout(activity).apply {
                            orientation = LinearLayout.HORIZONTAL
                            gravity = Gravity.CENTER_VERTICAL
                        }
                        header.addView(titleText(activity, "Подія #${event.id}"), LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
                        header.addView(badge(activity, event.severity, event.severity != "critical"))
                        addView(header)
                        addView(fieldRow(activity, "Швидкість", "${event.speed} км/год"))
                        addView(fieldRow(activity, "RPM", event.rpm))
                        addView(fieldRow(activity, "Удар", if (event.impact) "так" else "ні"))
                        addView(fieldRow(activity, "Гальмування", if (event.braking) "так" else "ні"))
                        addView(fieldRow(activity, "Дата", event.timestamp))
                        addView(fieldRow(activity, "Координати", "${event.latitude}, ${event.longitude}"))
                    }
                }
            }
        }
    }
}
