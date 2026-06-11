package com.nure.autoinsurancemobile.data

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class ApiClient(private val baseUrl: String) {

    fun get(path: String): ApiResponse = request("GET", path, null)

    fun post(path: String, body: JSONObject): ApiResponse = request("POST", path, body)

    private fun request(method: String, path: String, body: JSONObject?): ApiResponse {
        var connection: HttpURLConnection? = null
        return try {
            val url = URL(baseUrl + path)
            connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = method
            connection.connectTimeout = 15_000
            connection.readTimeout = 20_000
            connection.setRequestProperty("Accept", "application/json")

            if (body != null) {
                connection.doOutput = true
                connection.setRequestProperty("Content-Type", "application/json")
                connection.outputStream.use { output ->
                    output.write(body.toString().toByteArray(Charsets.UTF_8))
                }
            }

            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val responseBody = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
            ApiResponse(code, responseBody, null)
        } catch (e: Exception) {
            ApiResponse(0, "", e.message ?: e.toString())
        } finally {
            connection?.disconnect()
        }
    }

    fun createTelemetryPayload(): JSONObject = JSONObject().apply {
        put("vehicle_id", 1)
        put("timestamp", nowIso())
        put("speed", 72)
        put("engine_rpm", 2800)
        put("acceleration", 2.1)
        put("braking_flag", false)
        put("impact_flag", true)
        put("latitude", 49.9900)
        put("longitude", 36.2300)
    }

    fun createClaimPayload(): JSONObject = JSONObject().apply {
        put("policy_id", 1)
        put("reported_by_client_id", 1)
        put("event_time", "2025-06-12T12:00:00.000Z")
        put("location_lat", 49.9900)
        put("location_lng", 36.2300)
        put("description", "ДТП зафіксовано водієм через Android-застосунок")
        put("estimated_damage", 14000)
    }

    companion object {
        fun nowIso(): String {
            val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
            format.timeZone = TimeZone.getTimeZone("UTC")
            return format.format(Date())
        }
    }
}

data class ApiResponse(
    val code: Int,
    val body: String,
    val error: String?
) {
    val isSuccessful: Boolean get() = code in 200..299 && error == null
}
