package com.nure.autoinsurancemobile.screens

import android.view.View
import com.nure.autoinsurancemobile.MainActivity
import com.nure.autoinsurancemobile.data.Vehicle
import com.nure.autoinsurancemobile.navigation.AppScreen
import com.nure.autoinsurancemobile.ui.addButtonWithMargin
import com.nure.autoinsurancemobile.ui.addCard
import com.nure.autoinsurancemobile.ui.bodyText
import com.nure.autoinsurancemobile.ui.errorPage
import com.nure.autoinsurancemobile.ui.fieldRow
import com.nure.autoinsurancemobile.ui.loadingView
import com.nure.autoinsurancemobile.ui.page
import com.nure.autoinsurancemobile.ui.primaryButton
import com.nure.autoinsurancemobile.ui.titleText

class VehicleScreen {

    fun create(activity: MainActivity): View {
        activity.runOnBackground {
            val response = activity.api.get("/api/vehicles/1")
            activity.runOnUiThread {
                if (response.isSuccessful) {
                    try {
                        activity.setPage(render(activity, Vehicle.fromJson(response.body)))
                    } catch (e: Exception) {
                        activity.setPage(errorPage(activity, "Авто", e.message ?: "Помилка обробки відповіді") {
                            activity.navigate(AppScreen.Vehicle)
                        })
                    }
                } else {
                    activity.setPage(errorPage(activity, "Авто", response.error ?: "HTTP ${response.code}") {
                        activity.navigate(AppScreen.Vehicle)
                    })
                }
            }
        }
        return loadingView(activity, "Завантаження авто...")
    }

    private fun render(activity: MainActivity, vehicle: Vehicle): View {
        return page(activity, "Моє авто", "Транспортний засіб") {
            addCard(activity) {
                addView(titleText(activity, "${vehicle.make} ${vehicle.model}", 22f))
            }

            addCard(activity) {
                addView(titleText(activity, "Параметри авто"))
                addView(fieldRow(activity, "ID", vehicle.id.toString()))
                addView(fieldRow(activity, "Рік", vehicle.year))
                addView(fieldRow(activity, "Номер", vehicle.plateNumber))
                addView(fieldRow(activity, "VIN", vehicle.vin))
                addView(fieldRow(activity, "Паливо", vehicle.fuelType))
                addView(fieldRow(activity, "Об'єм двигуна", vehicle.engineCapacity))
                addButtonWithMargin(primaryButton(activity, "Перейти до телеметрії") {
                    activity.navigate(AppScreen.Telemetry)
                }, activity)
            }
        }
    }
}
