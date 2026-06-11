package com.nure.autoinsurancemobile.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

object ClaimWorkflow {
    const val CREATED = "Created"
    const val IN_REVIEW = "InReview"
    const val APPROVED = "Approved"
    const val REJECTED = "Rejected"
    const val PAID = "Paid"

    fun ua(status: String): String = when (status) {
        CREATED -> "Подано"
        IN_REVIEW -> "В роботі"
        APPROVED -> "Схвалено"
        REJECTED -> "Відхилено"
        PAID -> "Виплачено"
        else -> status
    }

    fun isPositive(status: String): Boolean = status != REJECTED
}

data class ClaimItem(
    val localId: Int,
    val serverId: Int?,
    val policyId: Int,
    val clientId: Int,
    val title: String,
    val description: String,
    val status: String,
    val estimatedDamage: Int,
    val approvedPayout: Int?,
    val eventTime: String,
    val location: String,
    val assignedManager: String?,
    val note: String,
    val createdFrom: String
) {
    fun toJson(): JSONObject = JSONObject().apply {
        put("localId", localId)
        put("serverId", serverId)
        put("policyId", policyId)
        put("clientId", clientId)
        put("title", title)
        put("description", description)
        put("status", status)
        put("estimatedDamage", estimatedDamage)
        put("approvedPayout", approvedPayout)
        put("eventTime", eventTime)
        put("location", location)
        put("assignedManager", assignedManager)
        put("note", note)
        put("createdFrom", createdFrom)
    }

    companion object {
        fun fromJson(json: JSONObject): ClaimItem = ClaimItem(
            localId = json.optInt("localId"),
            serverId = if (json.isNull("serverId")) null else json.optInt("serverId"),
            policyId = json.optInt("policyId", 1),
            clientId = json.optInt("clientId", 1),
            title = json.optString("title", "Заява про ДТП"),
            description = json.optString("description", "Опис події відсутній"),
            status = json.optString("status", ClaimWorkflow.CREATED),
            estimatedDamage = json.optInt("estimatedDamage", 0),
            approvedPayout = if (json.isNull("approvedPayout")) null else json.optInt("approvedPayout"),
            eventTime = json.optString("eventTime", "2025-06-12 12:00"),
            location = json.optString("location", "49.9900, 36.2300"),
            assignedManager = if (json.isNull("assignedManager")) null else json.optString("assignedManager"),
            note = json.optString("note", ""),
            createdFrom = json.optString("createdFrom", "Android")
        )
    }
}

class LocalClaimStore(context: Context) {
    private val prefs = context.getSharedPreferences("claim_store", Context.MODE_PRIVATE)
    private val key = "claims_json"

    fun all(): List<ClaimItem> {
        val raw = prefs.getString(key, null)
        if (raw.isNullOrBlank()) {
            val seed = seedClaims()
            save(seed)
            return seed
        }

        return try {
            val array = JSONArray(raw)
            val result = mutableListOf<ClaimItem>()
            for (i in 0 until array.length()) {
                result.add(ClaimItem.fromJson(array.getJSONObject(i)))
            }
            result.sortedByDescending { it.localId }
        } catch (_: Exception) {
            val seed = seedClaims()
            save(seed)
            seed
        }
    }

    fun createFromDriver(serverId: Int?): ClaimItem {
        val current = all().toMutableList()
        val nextId = (current.maxOfOrNull { it.localId } ?: 0) + 1
        val claim = ClaimItem(
            localId = nextId,
            serverId = serverId,
            policyId = 1,
            clientId = 1,
            title = "Заява про ДТП #$nextId",
            description = "Водій повідомив про ДТП через мобільний застосунок. Потрібна перевірка телеметрії та рішення менеджера.",
            status = ClaimWorkflow.CREATED,
            estimatedDamage = 14000,
            approvedPayout = null,
            eventTime = "2025-06-12 12:00",
            location = "49.9900, 36.2300",
            assignedManager = null,
            note = "Очікує реєстрації менеджером",
            createdFrom = "Android-застосунок"
        )
        current.add(claim)
        save(current)
        return claim
    }

    fun update(id: Int, transform: (ClaimItem) -> ClaimItem): ClaimItem? {
        val current = all().toMutableList()
        val index = current.indexOfFirst { it.localId == id }
        if (index == -1) return null
        val updated = transform(current[index])
        current[index] = updated
        save(current)
        return updated
    }

    fun resetDemo() {
        save(seedClaims())
    }

    private fun save(items: List<ClaimItem>) {
        val array = JSONArray()
        items.sortedBy { it.localId }.forEach { array.put(it.toJson()) }
        prefs.edit().putString(key, array.toString()).apply()
    }

    private fun seedClaims(): List<ClaimItem> = listOf(
        ClaimItem(
            localId = 1,
            serverId = 1,
            policyId = 1,
            clientId = 1,
            title = "Заява про ДТП #1",
            description = "ДТП зафіксовано водієм. Є удар і критична телеметрична подія.",
            status = ClaimWorkflow.IN_REVIEW,
            estimatedDamage = 14000,
            approvedPayout = null,
            eventTime = "2025-06-12 12:00",
            location = "49.9900, 36.2300",
            assignedManager = "Manager #2",
            note = "Менеджер перевіряє обставини ДТП",
            createdFrom = "Render API"
        ),
        ClaimItem(
            localId = 2,
            serverId = null,
            policyId = 1,
            clientId = 1,
            title = "Заява про пошкодження скла #2",
            description = "Клієнт повідомив про пошкодження лобового скла. Потрібна оцінка збитку.",
            status = ClaimWorkflow.CREATED,
            estimatedDamage = 6200,
            approvedPayout = null,
            eventTime = "2025-06-14 09:30",
            location = "50.0010, 36.2450",
            assignedManager = null,
            note = "Очікує взяття в роботу",
            createdFrom = "Локальна демо-логіка"
        ),
        ClaimItem(
            localId = 3,
            serverId = null,
            policyId = 1,
            clientId = 1,
            title = "Заява про парковочне пошкодження #3",
            description = "Пошкодження бампера на парковці. Сума виплати вже погоджена.",
            status = ClaimWorkflow.APPROVED,
            estimatedDamage = 9000,
            approvedPayout = 7600,
            eventTime = "2025-06-16 18:20",
            location = "49.9860, 36.2100",
            assignedManager = "Manager #2",
            note = "Рішення прийнято, очікується виплата",
            createdFrom = "Локальна демо-логіка"
        )
    )
}
