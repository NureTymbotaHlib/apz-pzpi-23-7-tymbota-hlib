package com.nure.autoinsurancemobile.screens

import android.view.View
import com.nure.autoinsurancemobile.MainActivity
import com.nure.autoinsurancemobile.navigation.AppScreen
import com.nure.autoinsurancemobile.ui.addButtonWithMargin
import com.nure.autoinsurancemobile.ui.addCard
import com.nure.autoinsurancemobile.ui.badge
import com.nure.autoinsurancemobile.ui.fieldRow
import com.nure.autoinsurancemobile.ui.page
import com.nure.autoinsurancemobile.ui.primaryButton
import com.nure.autoinsurancemobile.ui.secondaryButton
import com.nure.autoinsurancemobile.ui.titleText

class ProfileScreen {

    fun create(activity: MainActivity): View {
        return page(activity, "Профіль", "Налаштування доступу") {
            addCard(activity) {
                addView(titleText(activity, "Тимбота Гліб Олексійович"))
                addView(fieldRow(activity, "Група", "ПЗПІ-23-7"))
                addView(fieldRow(activity, "Система", "AutoInsurance"))
                addView(fieldRow(activity, "Поточна роль", activity.selectedRole.title))
            }

            addCard(activity) {
                addView(titleText(activity, "Вибір ролі"))
                addRoleButton(activity, MainActivity.UserRole.DRIVER)
                addRoleButton(activity, MainActivity.UserRole.AGENT)
                addRoleButton(activity, MainActivity.UserRole.MANAGER)
                addRoleButton(activity, MainActivity.UserRole.ADMIN)
            }

            addCard(activity) {
                addView(titleText(activity, "Доступні розділи"))
                when (activity.selectedRole) {
                    MainActivity.UserRole.DRIVER -> {
                        addView(fieldRow(activity, "Поліс", "перегляд"))
                        addView(fieldRow(activity, "Авто", "перегляд"))
                        addView(fieldRow(activity, "Заявки", "створення"))
                        addView(fieldRow(activity, "Телеметрія", "надсилання"))
                    }
                    MainActivity.UserRole.AGENT -> {
                        addView(fieldRow(activity, "Поліси", "перегляд"))
                        addView(fieldRow(activity, "Клієнтські авто", "перегляд"))
                    }
                    MainActivity.UserRole.MANAGER -> {
                        addView(fieldRow(activity, "Заявки", "розгляд"))
                        addView(fieldRow(activity, "Телеметрія", "аналіз"))
                    }
                    MainActivity.UserRole.ADMIN -> {
                        addView(fieldRow(activity, "API", "контроль"))
                        addView(fieldRow(activity, "Користувачі", "рольова модель"))
                    }
                }
                addButtonWithMargin(primaryButton(activity, "На головну") {
                    activity.navigate(AppScreen.Home)
                }, activity)
            }

            addCard(activity) {
                addView(titleText(activity, "Підключення"))
                addView(fieldRow(activity, "Backend", "Render"))
                addView(fieldRow(activity, "API", "auto-insurance-server.onrender.com"))
                addView(fieldRow(activity, "База даних", "MongoDB Atlas"))
            }
        }
    }

    private fun android.widget.LinearLayout.addRoleButton(activity: MainActivity, role: MainActivity.UserRole) {
        val selected = activity.selectedRole == role
        val button = if (selected) {
            primaryButton(activity, "${role.title}  ✓") { activity.selectRole(role) }
        } else {
            secondaryButton(activity, role.title) { activity.selectRole(role) }
        }
        addButtonWithMargin(button, activity)
    }
}
