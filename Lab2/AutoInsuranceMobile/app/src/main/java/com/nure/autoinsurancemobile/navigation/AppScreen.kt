package com.nure.autoinsurancemobile.navigation

sealed class AppScreen {
    object Home : AppScreen()
    object Policy : AppScreen()
    object Vehicle : AppScreen()
    object Telemetry : AppScreen()
    object Claims : AppScreen()
    object Profile : AppScreen()
}
