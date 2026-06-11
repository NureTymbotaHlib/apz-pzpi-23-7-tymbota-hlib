package com.nure.autoinsurancemobile.ui

import android.content.Context
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

fun Context.dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

fun rounded(color: Int, radius: Int, strokeColor: Int? = null, strokeWidth: Int = 1): GradientDrawable {
    return GradientDrawable().apply {
        setColor(color)
        cornerRadius = radius.toFloat()
        if (strokeColor != null) setStroke(strokeWidth, strokeColor)
    }
}

fun page(context: Context, title: String, subtitle: String? = null, content: LinearLayout.() -> Unit): ScrollView {
    val body = LinearLayout(context).apply {
        orientation = LinearLayout.VERTICAL
        setPadding(context.dp(18), context.dp(18), context.dp(18), context.dp(28))
        setBackgroundColor(AppTheme.Background)
    }

    body.addView(TextView(context).apply {
        text = title
        textSize = 26f
        setTypeface(null, Typeface.BOLD)
        setTextColor(AppTheme.Text)
    })

    if (subtitle != null) {
        body.addView(TextView(context).apply {
            text = subtitle
            textSize = 14f
            setTextColor(AppTheme.MutedText)
            setPadding(0, context.dp(6), 0, context.dp(16))
        })
    } else {
        body.addView(space(context, 12))
    }

    body.content()

    return ScrollView(context).apply {
        isFillViewport = false
        addView(body)
    }
}

fun card(context: Context, content: LinearLayout.() -> Unit): LinearLayout {
    return LinearLayout(context).apply {
        orientation = LinearLayout.VERTICAL
        setPadding(context.dp(16), context.dp(16), context.dp(16), context.dp(16))
        background = rounded(AppTheme.Surface, context.dp(18), AppTheme.Border, context.dp(1))
        elevation = context.dp(2).toFloat()
        content()
    }
}

fun LinearLayout.addCard(context: Context, content: LinearLayout.() -> Unit) {
    val params = LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
    ).apply { setMargins(0, 0, 0, context.dp(12)) }
    addView(card(context, content), params)
}

fun titleText(context: Context, textValue: String, size: Float = 18f): TextView = TextView(context).apply {
    text = textValue
    textSize = size
    setTypeface(null, Typeface.BOLD)
    setTextColor(AppTheme.Text)
}

fun bodyText(context: Context, textValue: String): TextView = TextView(context).apply {
    text = textValue
    textSize = 14f
    setTextColor(AppTheme.MutedText)
    setPadding(0, context.dp(4), 0, context.dp(4))
}

fun fieldRow(context: Context, label: String, value: String): LinearLayout {
    return LinearLayout(context).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        setPadding(0, context.dp(7), 0, context.dp(7))

        addView(TextView(context).apply {
            text = label
            textSize = 13f
            setTextColor(AppTheme.MutedText)
        }, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))

        addView(TextView(context).apply {
            text = value.ifBlank { "—" }
            textSize = 14f
            setTypeface(null, Typeface.BOLD)
            setTextColor(AppTheme.Text)
            gravity = Gravity.END
        }, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
    }
}

fun metricCard(context: Context, label: String, value: String): LinearLayout {
    return LinearLayout(context).apply {
        orientation = LinearLayout.VERTICAL
        gravity = Gravity.CENTER
        setPadding(context.dp(12), context.dp(12), context.dp(12), context.dp(12))
        background = rounded(AppTheme.SurfaceSoft, context.dp(14))

        addView(TextView(context).apply {
            text = value
            textSize = 18f
            setTypeface(null, Typeface.BOLD)
            setTextColor(AppTheme.PrimaryDark)
            gravity = Gravity.CENTER
        })
        addView(TextView(context).apply {
            text = label
            textSize = 12f
            setTextColor(AppTheme.MutedText)
            gravity = Gravity.CENTER
        })
    }
}

fun primaryButton(context: Context, textValue: String, action: () -> Unit): Button = Button(context).apply {
    text = textValue
    isAllCaps = false
    textSize = 14f
    setTextColor(AppTheme.Surface)
    background = rounded(AppTheme.Primary, context.dp(14))
    setPadding(context.dp(10), context.dp(10), context.dp(10), context.dp(10))
    setOnClickListener { action() }
}

fun secondaryButton(context: Context, textValue: String, action: () -> Unit): Button = Button(context).apply {
    text = textValue
    isAllCaps = false
    textSize = 14f
    setTextColor(AppTheme.PrimaryDark)
    background = rounded(AppTheme.SurfaceSoft, context.dp(14), AppTheme.Border, context.dp(1))
    setPadding(context.dp(10), context.dp(10), context.dp(10), context.dp(10))
    setOnClickListener { action() }
}

fun LinearLayout.addButtonWithMargin(button: Button, context: Context) {
    addView(button, LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
    ).apply { setMargins(0, context.dp(8), 0, 0) })
}

fun badge(context: Context, textValue: String, success: Boolean = true): TextView = TextView(context).apply {
    text = textValue
    textSize = 12f
    setTypeface(null, Typeface.BOLD)
    setTextColor(if (success) AppTheme.Success else AppTheme.Danger)
    setPadding(context.dp(10), context.dp(5), context.dp(10), context.dp(5))
    background = rounded(if (success) 0xFFE6F3ED.toInt() else 0xFFF7E3E0.toInt(), context.dp(16))
}

fun loadingView(context: Context, message: String): View {
    return FrameLayout(context).apply {
        setBackgroundColor(AppTheme.Background)
        addView(TextView(context).apply {
            text = message
            textSize = 16f
            setTextColor(AppTheme.MutedText)
            gravity = Gravity.CENTER
        }, FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ))
    }
}

fun errorPage(context: Context, title: String, message: String, retry: () -> Unit): View {
    return page(context, title, "Не вдалося отримати дані від сервера") {
        addCard(context) {
            addView(titleText(context, "Помилка"))
            addView(bodyText(context, message))
            addButtonWithMargin(primaryButton(context, "Спробувати ще раз", retry), context)
        }
    }
}

fun space(context: Context, height: Int): View = View(context).apply {
    layoutParams = LinearLayout.LayoutParams(1, context.dp(height))
}
