package com.nure.autoinsurancemobile.data

import org.json.JSONArray
import org.json.JSONObject

data class Policy(
    val id: Int,
    val number: String,
    val type: String,
    val status: String,
    val startDate: String,
    val endDate: String,
    val basePremium: String,
    val finalPremium: String,
    val tariffPlan: String,
    val clientId: Int,
    val vehicleId: Int
) {
    companion object {
        fun fromJson(raw: String): Policy {
            val json = JSONObject(raw)
            return Policy(
                id = json.optInt("policy_id", 1),
                number = json.optString("policy_number", "POL-000001"),
                type = json.optString("type", "OSCPV"),
                status = json.optString("status", "Active"),
                startDate = shortDate(json.optString("start_date")),
                endDate = shortDate(json.optString("end_date")),
                basePremium = money(json.optDouble("base_premium", 0.0)),
                finalPremium = money(json.optDouble("final_premium", 0.0)),
                tariffPlan = json.optString("tariff_plan", "Standard"),
                clientId = json.optInt("client_id", 1),
                vehicleId = json.optInt("vehicle_id", 1)
            )
        }
    }
}

data class Vehicle(
    val id: Int,
    val make: String,
    val model: String,
    val year: String,
    val vin: String,
    val plateNumber: String,
    val fuelType: String,
    val engineCapacity: String
) {
    companion object {
        fun fromJson(raw: String): Vehicle {
            val json = JSONObject(raw)
            return Vehicle(
                id = json.optInt("vehicle_id", 1),
                make = json.optString("make", "Toyota"),
                model = json.optString("model", "Camry"),
                year = json.optString("year", "2021"),
                vin = json.optString("vin", "VIN000001"),
                plateNumber = json.optString("plate_number", "AX0001AA"),
                fuelType = json.optString("fuel_type", "Petrol"),
                engineCapacity = json.optString("engine_capacity", "2.5")
            )
        }
    }
}

data class TelemetryEvent(
    val id: Int,
    val speed: String,
    val rpm: String,
    val impact: Boolean,
    val braking: Boolean,
    val severity: String,
    val timestamp: String,
    val latitude: String,
    val longitude: String
) {
    companion object {
        fun listFromJson(raw: String): List<TelemetryEvent> {
            val trimmed = raw.trim()
            val array = when {
                trimmed.startsWith("[") -> JSONArray(trimmed)
                trimmed.startsWith("{") -> {
                    val obj = JSONObject(trimmed)
                    when {
                        obj.has("data") && obj.get("data") is JSONArray -> obj.getJSONArray("data")
                        obj.has("items") && obj.get("items") is JSONArray -> obj.getJSONArray("items")
                        obj.has("events") && obj.get("events") is JSONArray -> obj.getJSONArray("events")
                        else -> JSONArray().put(obj)
                    }
                }
                else -> JSONArray()
            }

            val result = mutableListOf<TelemetryEvent>()
            for (i in 0 until array.length()) {
                val json = array.optJSONObject(i) ?: continue
                result.add(fromJson(json))
            }
            return result.sortedByDescending { it.id }
        }

        fun fromJson(json: JSONObject): TelemetryEvent = TelemetryEvent(
            id = json.optInt("event_id", json.optInt("id", 0)),
            speed = json.optString("speed", "0"),
            rpm = json.optString("engine_rpm", "0"),
            impact = json.optBoolean("impact_flag", false),
            braking = json.optBoolean("braking_flag", false),
            severity = json.optString("severity", if (json.optBoolean("impact_flag", false)) "critical" else "normal"),
            timestamp = shortDateTime(json.optString("timestamp")),
            latitude = json.optString("latitude", "0"),
            longitude = json.optString("longitude", "0")
        )
    }
}

data class ClaimStatus(
    val id: Int,
    val status: String,
    val description: String,
    val estimatedDamage: String,
    val eventTime: String
) {
    companion object {
        fun fromJson(raw: String, fallbackId: Int): ClaimStatus {
            val json = JSONObject(raw)
            return ClaimStatus(
                id = json.optInt("claim_id", fallbackId),
                status = json.optString("status", "Created"),
                description = json.optString("description", "Заявку створено"),
                estimatedDamage = money(json.optDouble("estimated_damage", 0.0)),
                eventTime = shortDateTime(json.optString("event_time"))
            )
        }
    }
}

fun shortDate(value: String): String = value.take(10).ifBlank { "—" }

fun shortDateTime(value: String): String = when {
    value.length >= 16 -> value.substring(0, 16).replace('T', ' ')
    value.isNotBlank() -> value
    else -> "—"
}

fun money(value: Double): String = if (value == 0.0) "—" else String.format("%.0f грн", value)
