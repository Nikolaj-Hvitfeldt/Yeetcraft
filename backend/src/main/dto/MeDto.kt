package com.yeetcraft.dto

import kotlinx.serialization.Serializable

@Serializable
data class MeDto(
    val sub: String,
    val email: String?,
    val playerId: Int?,
    val isAdmin: Boolean
)
