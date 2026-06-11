package com.nure.autoinsurancemobile

import android.app.Activity
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import com.nure.autoinsurancemobile.data.ApiClient
import com.nure.autoinsurancemobile.data.LocalClaimStore
import com.nure.autoinsurancemobile.navigation.AppScreen
import com.nure.autoinsurancemobile.screens.ClaimsScreen
import com.nure.autoinsurancemobile.screens.HomeScreen
import com.nure.autoinsurancemobile.screens.PolicyScreen
import com.nure.autoinsurancemobile.screens.ProfileScreen
import com.nure.autoinsurancemobile.screens.TelemetryScreen
import com.nure.autoinsurancemobile.screens.VehicleScreen
import com.nure.autoinsurancemobile.ui.AppTheme
import com.nure.autoinsurancemobile.ui.dp
import com.nure.autoinsurancemobile.ui.loadingView

class MainActivity : Activity() {

    val api = ApiClient("https://auto-insurance-server.onrender.com")
    val claimStore: LocalClaimStore by lazy { LocalClaimStore(this) }

    enum class UserRole(val title: String, val description: String) {
        DRIVER("Driver", "Кабінет водія"),
        AGENT("Agent", "Робочий режим страхового агента"),
        MANAGER("Manager", "Робочий режим менеджера з врегулювання"),
        ADMIN("Admin", "Адміністративний режим")
    }

    var selectedRole: UserRole = UserRole.DRIVER
        private set

    fun selectRole(role: UserRole) {
        selectedRole = role
        navigate(AppScreen.Profile)
    }

    private lateinit var contentHost: FrameLayout
    private lateinit var bottomNav: LinearLayout
    private var currentScreen: AppScreen = AppScreen.Home

    private val homeScreen = HomeScreen()
    private val policyScreen = PolicyScreen()
    private val vehicleScreen = VehicleScreen()
    private val telemetryScreen = TelemetryScreen()
    private val claimsScreen = ClaimsScreen()
    private val profileScreen = ProfileScreen()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.statusBarColor = AppTheme.Background
        window.navigationBarColor = AppTheme.Surface

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(AppTheme.Background)
        }

        contentHost = FrameLayout(this)
        root.addView(
            contentHost,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                0,
                1f
            )
        )

        bottomNav = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(dp(8), dp(6), dp(8), dp(6))
            setBackgroundColor(AppTheme.Surface)
            elevation = dp(8).toFloat()
        }
        root.addView(
            bottomNav,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        )

        setContentView(root)
        navigate(AppScreen.Home)
    }

    fun navigate(screen: AppScreen) {
        currentScreen = screen
        refreshBottomNav()
        showLoading()

        val page = when (screen) {
            AppScreen.Home -> homeScreen.create(this)
            AppScreen.Policy -> policyScreen.create(this)
            AppScreen.Vehicle -> vehicleScreen.create(this)
            AppScreen.Telemetry -> telemetryScreen.create(this)
            AppScreen.Claims -> claimsScreen.create(this)
            AppScreen.Profile -> profileScreen.create(this)
        }

        setPage(page)
    }

    fun setPage(view: View) {
        contentHost.removeAllViews()
        view.alpha = 0f
        contentHost.addView(view)
        view.animate().alpha(1f).setDuration(180).start()
    }

    fun showLoading(message: String = "Завантаження...") {
        contentHost.removeAllViews()
        contentHost.addView(loadingView(this, message))
    }

    fun runOnBackground(task: () -> Unit) {
        Thread(task).start()
    }

    private fun refreshBottomNav() {
        bottomNav.removeAllViews()
        addNavItem("Головна", AppScreen.Home)
        addNavItem("Поліс", AppScreen.Policy)
        addNavItem("Авто", AppScreen.Vehicle)
        addNavItem("Телеметрія", AppScreen.Telemetry)
        addNavItem("Заявки", AppScreen.Claims)
        addNavItem("Профіль", AppScreen.Profile)
    }

    private fun addNavItem(label: String, screen: AppScreen) {
        val selected = currentScreen == screen
        val item = TextView(this).apply {
            text = label
            gravity = Gravity.CENTER
            textSize = 12f
            setTextColor(if (selected) AppTheme.Primary else AppTheme.MutedText)
            setTypeface(null, if (selected) android.graphics.Typeface.BOLD else android.graphics.Typeface.NORMAL)
            setPadding(dp(4), dp(8), dp(4), dp(8))
            setOnClickListener { navigate(screen) }
        }

        bottomNav.addView(
            item,
            LinearLayout.LayoutParams(
                0,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                1f
            )
        )
    }
}
