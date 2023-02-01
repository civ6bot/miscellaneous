import { DynamicConfigEntity } from "./dynamicConfig.models";

export const tagsMap: Map<string, string[]> = new Map<string, string[]>([
    ["DYNAMIC_CONFIG_TITLE", [
        "DYNAMIC_CONFIG_LANGUAGE", "DYNAMIC_CONFIG_MODERATION",
        "DYNAMIC_CONFIG_MODERATION_NOTIFICATIONS"
    ]],
]);

export const configsMap = new Map<string, DynamicConfigEntity[]>([
    ["DYNAMIC_CONFIG_LANGUAGE", []],
    ["DYNAMIC_CONFIG_MODERATION", [
        {
            configTag: "MODERATION_ROLE_MODERATORS_ID",
            textTag: "DYNAMIC_CONFIG_MODERATION_ROLE_MODERATORS_ID",
            type: "RoleMany",
            minAmount: 0,
            maxAmount: 10
        },
        {
            configTag: "MODERATION_CHANNEL_ID",
            textTag: "DYNAMIC_CONFIG_MODERATION_CHANNEL_ID",
            type: "ChannelMany",
            minAmount: 0,
            maxAmount: 1
        },
        {
            configTag: "MODERATION_ROLE_BAN_ID",
            textTag: "DYNAMIC_CONFIG_MODERATION_ROLE_BAN_ID",
            type: "RoleMany",
            minAmount: 0,
            maxAmount: 1
        },
        {
            configTag: "MODERATION_ROLE_MUTE_CHAT_ID",
            textTag: "DYNAMIC_CONFIG_MODERATION_ROLE_MUTE_CHAT_ID",
            type: "RoleMany",
            minAmount: 0,
            maxAmount: 1
        },
        {
            configTag: "MODERATION_ROLE_MUTE_VOICE_ID",
            textTag: "DYNAMIC_CONFIG_MODERATION_ROLE_MUTE_VOICE_ID",
            type: "RoleMany",
            minAmount: 0,
            maxAmount: 1
        },
        {
            configTag: "MODERATION_CLEAR_MAX",
            textTag: "DYNAMIC_CONFIG_MODERATION_CLEAR_MAX",
            type: "Number",
            minValue: 1,
            maxValue: 100
        },
        {
            configTag: "MODERATION_BAN_TIERS",
            textTag: "DYNAMIC_CONFIG_MODERATION_BAN_TIERS",
            type: "NumberMany",
            minAmount: 1,
            maxAmount: 16,
            minValue: 1,
            maxValue: 365
        },
        {
            configTag: "MODERATION_BAN_TIER_DECREASE_DAYS",
            textTag: "DYNAMIC_CONFIG_MODERATION_BAN_TIER_DECREASE_DAYS",
            type: "Number",
            minValue: 1,
            maxValue: 365
        }
    ]],
    ["DYNAMIC_CONFIG_MODERATION_NOTIFICATIONS", [
        {
            configTag: "MODERATION_NOTIFICATION_UNBAN",
            textTag: "DYNAMIC_CONFIG_MODERATION_NOTIFICATIONS_UNBAN",
            type: "Boolean"
        },
        {
            configTag: "MODERATION_NOTIFICATION_UNMUTE_CHAT",
            textTag: "DYNAMIC_CONFIG_MODERATION_NOTIFICATIONS_UNMUTE_CHAT",
            type: "Boolean"
        },
        {
            configTag: "MODERATION_NOTIFICATION_UNMUTE_VOICE",
            textTag: "DYNAMIC_CONFIG_MODERATION_NOTIFICATIONS_UNMUTE_VOICE",
            type: "Boolean"
        },
        {
            configTag: "MODERATION_NOTIFICATION_PARDON",
            textTag: "DYNAMIC_CONFIG_MODERATION_NOTIFICATIONS_PARDON",
            type: "Boolean"
        },
    ]]
]);
