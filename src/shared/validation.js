const { z } = require("zod");

const updateSettingsSchema = z.object({
  modules: z
    .object({
      moderation: z.coerce.boolean().optional(),
      logs: z.coerce.boolean().optional(),
      welcome: z.coerce.boolean().optional(),
      autorole: z.coerce.boolean().optional()
    })
    .partial()
    .optional(),
  channels: z
    .object({
      logsChannelId: z.string().min(1).optional().nullable(),
      welcomeChannelId: z.string().min(1).optional().nullable()
    })
    .partial()
    .optional(),
  roles: z
    .object({
      muteRoleId: z.string().min(1).optional().nullable(),
      autoRoleId: z.string().min(1).optional().nullable()
    })
    .partial()
    .optional(),
  settings: z
    .object({
      purgeLimitMax: z.coerce.number().int().min(1).max(1000).optional(),
      locale: z.enum(["fr", "en"]).optional()
    })
    .partial()
    .optional()
});

const sendMessageSchema = z.object({
  channelId: z.string().min(1),
  content: z.string().min(1).max(2000)
});

const purgeSchema = z.object({
  channelId: z.string().min(1),
  count: z.coerce.number().int().min(1).max(1000)
});

const moderateSchema = z.object({
  action: z.enum(["timeout", "kick", "ban"]),
  userId: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(1).max(10080).optional(), // for timeout
  reason: z.string().max(512).optional()
});

module.exports = {
  updateSettingsSchema,
  sendMessageSchema,
  purgeSchema,
  moderateSchema
};
