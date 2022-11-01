import {
    JSONDynamicConfigEntityBoolean, JSONDynamicConfigEntityBooleanGameSetting, JSONDynamicConfigEntityChannelMany,
    JSONDynamicConfigEntityNumber, JSONDynamicConfigEntityNumberMany, JSONDynamicConfigEntityRoleMany,
    JSONDynamicConfigEntityString, JSONDynamicConfigEntityTeamersForbiddenPairs
} from "../../types/type.JSON.DynamicConfigEntities";

export const tagsMap: Map<string, string[]> = new Map<string, string[]>([
    ["DYNAMIC_CONFIG_TITLE", [
        "DYNAMIC_CONFIG_LANGUAGE", "DYNAMIC_CONFIG_MODERATION"
    ]],
]);

export const configsMap = new Map<string, (JSONDynamicConfigEntityNumber
    |JSONDynamicConfigEntityString
    |JSONDynamicConfigEntityBoolean
    |JSONDynamicConfigEntityTeamersForbiddenPairs
    |JSONDynamicConfigEntityBooleanGameSetting
    |JSONDynamicConfigEntityNumberMany
    |JSONDynamicConfigEntityRoleMany
    |JSONDynamicConfigEntityChannelMany
    )[]>([
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
    ]]
]);
