/**
 * Types extracted from https://discord.com/developers/docs/resources/channel
 */

import type { Permissions, Snowflake } from '../../globals';
import type { APIApplication } from './application';
import type { APIPartialEmoji } from './emoji';
import type { APIGuildMember } from './guild';
import type { APIInteractionDataResolved, APIMessageInteraction, APIMessageInteractionMetadata } from './interactions';
import type { APIRole } from './permissions';
import type { APIPoll } from './poll';
import type { APISticker, APIStickerItem } from './sticker';
import type { APIUser } from './user';

/**
 * Not documented, but partial only includes id, name, and type
 */
export interface APIPartialChannel {
	/**
	 * The id of the channel
	 */
	id: Snowflake;
	/**
	 * The type of the channel
	 *
	 * See https://discord.com/developers/docs/resources/channel#channel-object-channel-types
	 */
	type: ChannelType;
	/**
	 * The name of the channel (1-100 characters)
	 */
	name?: string | null;
}

/**
 * This interface is used to allow easy extension for other channel types. While
 * also allowing `APIPartialChannel` to be used without breaking.
 */
export interface APIChannelBase<T extends ChannelType> extends APIPartialChannel {
	type: T;
	flags?: ChannelFlags;
}

export type TextChannelType =
	| ChannelType.AnnouncementThread
	| ChannelType.DM
	| ChannelType.GroupDM
	| ChannelType.GuildAnnouncement
	| ChannelType.GuildStageVoice
	| ChannelType.GuildText
	| ChannelType.GuildVoice
	| ChannelType.PrivateThread
	| ChannelType.PublicThread;

export type GuildChannelType = Exclude<ChannelType, ChannelType.DM | ChannelType.GroupDM>;

export interface APITextBasedChannel<T extends ChannelType> extends APIChannelBase<T> {
	/**
	 * The id of the last message sent in this channel (may not point to an existing or valid message)
	 */
	last_message_id?: Snowflake | null;
	/**
	 * When the last pinned message was pinned.
	 * This may be `null` in events such as `GUILD_CREATE` when a message is not pinned
	 */
	last_pin_timestamp?: string | null;
	/**
	 * Amount of seconds a user has to wait before sending another message (0-21600);
	 * bots, as well as users with the permission `MANAGE_MESSAGES` or `MANAGE_CHANNELS`, are unaffected
	 *
	 * `rate_limit_per_user` also applies to thread creation. Users can send one message and create one thread during each `rate_limit_per_user` interval.
	 *
	 * For thread channels, `rate_limit_per_user` is only returned if the field is set to a non-zero and non-null value.
	 * The absence of this field in API calls and Gateway events should indicate that slowmode has been reset to the default value.
	 */
	rate_limit_per_user?: number;
}

export interface APIGuildChannel<T extends ChannelType> extends Omit<APIChannelBase<T>, 'name'> {
	/**
	 * The name of the channel (1-100 characters)
	 */
	name: string;
	/**
	 * The id of the guild (may be missing for some channel objects received over gateway guild dispatches)
	 */
	guild_id?: Snowflake;
	/**
	 * Explicit permission overwrites for members and roles
	 *
	 * See https://discord.com/developers/docs/resources/channel#overwrite-object
	 */
	permission_overwrites?: APIOverwrite[];
	/**
	 * Sorting position of the channel
	 */
	position: number;
	/**
	 * ID of the parent category for a channel (each parent category can contain up to 50 channels)
	 *
	 * OR
	 *
	 * ID of the parent channel for a thread
	 */
	parent_id?: Snowflake | null;
	/**
	 * Whether the channel is nsfw
	 */
	nsfw?: boolean;
}

export type GuildTextChannelType = Exclude<TextChannelType, ChannelType.DM | ChannelType.GroupDM>;

export interface APIGuildTextChannel<T extends ChannelType.GuildForum | ChannelType.GuildMedia | GuildTextChannelType>
	extends Omit<APITextBasedChannel<T>, 'name'>,
		APIGuildChannel<T> {
	/**
	 * Default duration for newly created threads, in minutes, to automatically archive the thread after recent activity
	 */
	default_auto_archive_duration?: ThreadAutoArchiveDuration;
	/**
	 * The initial `rate_limit_per_user` to set on newly created threads.
	 * This field is copied to the thread at creation time and does not live update
	 */
	default_thread_rate_limit_per_user?: number;
	/**
	 * The channel topic (0-1024 characters)
	 */
	topic?: string | null;
}

export type APITextChannel = APIGuildTextChannel<ChannelType.GuildText>;
export type APINewsChannel = APIGuildTextChannel<ChannelType.GuildAnnouncement>;
export type APIGuildCategoryChannel = APIGuildChannel<ChannelType.GuildCategory>;

export interface APIVoiceChannelBase<T extends ChannelType>
	extends APIGuildChannel<T>,
		Omit<APITextBasedChannel<T>, 'last_pin_timestamp' | 'name'> {
	/**
	 * The bitrate (in bits) of the voice or stage channel
	 */
	bitrate?: number;
	/**
	 * The user limit of the voice or stage channel
	 */
	user_limit?: number;
	/**
	 * Voice region id for the voice or stage channel, automatic when set to `null`
	 *
	 * See https://discord.com/developers/docs/resources/voice#voice-region-object
	 */
	rtc_region?: string | null;
	/**
	 * The camera video quality mode of the voice or stage channel, `1` when not present
	 *
	 * See https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes
	 */
	video_quality_mode?: VideoQualityMode;
}

export type APIGuildVoiceChannel = APIVoiceChannelBase<ChannelType.GuildVoice>;

export type APIGuildStageVoiceChannel = APIVoiceChannelBase<ChannelType.GuildStageVoice>;

export interface APIDMChannelBase<T extends ChannelType> extends Omit<APITextBasedChannel<T>, 'rate_limit_per_user'> {
	/**
	 * The recipients of the DM
	 *
	 * See https://discord.com/developers/docs/resources/user#user-object
	 */
	recipients?: APIUser[];
}

export interface APIDMChannel extends Omit<APIDMChannelBase<ChannelType.DM>, 'name'> {
	/**
	 * The name of the channel (always null for DM channels)
	 */
	name: null;
}

export interface APIGroupDMChannel extends Omit<APIDMChannelBase<ChannelType.GroupDM>, 'name'> {
	/**
	 * The name of the channel (1-100 characters)
	 */
	name: string | null;
	/**
	 * Application id of the group DM creator if it is bot-created
	 */
	application_id?: Snowflake;
	/**
	 * Icon hash
	 */
	icon?: string | null;
	/**
	 * ID of the DM creator
	 */
	owner_id?: Snowflake;
	/**
	 * The id of the last message sent in this channel (may not point to an existing or valid message)
	 */
	last_message_id?: Snowflake | null;
	/**
	 * Whether the channel is managed by an OAuth2 application
	 */
	managed?: boolean;
}

export type ThreadChannelType = ChannelType.AnnouncementThread | ChannelType.PrivateThread | ChannelType.PublicThread;

export interface APIThreadChannel
	extends Omit<APITextBasedChannel<ThreadChannelType>, 'name'>,
		APIGuildChannel<ThreadChannelType> {
	/**
	 * The client users member for the thread, only included in select endpoints
	 */
	member?: APIThreadMember;
	/**
	 * The metadata for a thread channel not shared by other channels
	 */
	thread_metadata?: APIThreadMetadata;
	/**
	 * Number of messages (not including the initial message or deleted messages) in a thread
	 *
	 * If the thread was created before July 1, 2022, it stops counting at 50 messages
	 */
	message_count?: number;
	/**
	 * The approximate member count of the thread, does not count above 50 even if there are more members
	 */
	member_count?: number;
	/**
	 * ID of the thread creator
	 */
	owner_id?: Snowflake;
	/**
	 * Number of messages ever sent in a thread
	 *
	 * Similar to `message_count` on message creation, but won't decrement when a message is deleted
	 */
	total_message_sent?: number;
	/**
	 * The IDs of the set of tags that have been applied to a thread in a thread-only channel
	 */
	applied_tags: Snowflake[];
}

/**
 * https://discord.com/developers/docs/resources/channel#forum-tag-object-forum-tag-structure
 */
export interface APIGuildForumTag {
	/**
	 * The id of the tag
	 */
	id: Snowflake;
	/**
	 * The name of the tag (0-20 characters)
	 */
	name: string;
	/**
	 * Whether this tag can only be added to or removed from threads by a member with the `MANAGE_THREADS` permission
	 */
	moderated: boolean;
	/**
	 * The id of a guild's custom emoji
	 */
	emoji_id: Snowflake | null;
	/**
	 * The unicode character of the emoji
	 */
	emoji_name: string | null;
}

/**
 * https://discord.com/developers/docs/resources/channel#default-reaction-object-default-reaction-structure
 */
export interface APIGuildForumDefaultReactionEmoji {
	/**
	 * The id of a guild's custom emoji
	 */
	emoji_id: Snowflake | null;
	/**
	 * The unicode character of the emoji
	 */
	emoji_name: string | null;
}

/**
 * https://discord.com/developers/docs/resources/channel/#channel-object-sort-order-types
 */
export enum SortOrderType {
	/**
	 * Sort forum posts by activity
	 */
	LatestActivity,
	/**
	 * Sort forum posts by creation time (from most recent to oldest)
	 */
	CreationDate,
}

/**
 * https://discord.com/developers/docs/resources/channel/#channel-object-forum-layout-types
 */
export enum ForumLayoutType {
	/**
	 * No default has been set for forum channel
	 */
	NotSet,
	/**
	 * Display posts as a list
	 */
	ListView,
	/**
	 * Display posts as a collection of tiles
	 */
	GalleryView,
}

export interface APIThreadOnlyChannel<T extends ChannelType.GuildForum | ChannelType.GuildMedia>
	extends APIGuildChannel<T> {
	/**
	 * The channel topic (0-4096 characters)
	 */
	topic?: string | null;
	/**
	 * The id of the last thread created in this channel (may not point to an existing or valid thread)
	 */
	last_message_id?: Snowflake | null;
	/**
	 * Amount of seconds a user has to wait before creating another thread (0-21600);
	 * bots, as well as users with the permission `MANAGE_MESSAGES` or `MANAGE_CHANNELS`, are unaffected
	 *
	 * The absence of this field in API calls and Gateway events should indicate that slowmode has been reset to the default value.
	 */
	rate_limit_per_user?: number;
	/**
	 * When the last pinned message was pinned.
	 * This may be `null` in events such as `GUILD_CREATE` when a message is not pinned
	 */
	last_pin_timestamp?: string | null;
	/**
	 * Default duration for newly created threads, in minutes, to automatically archive the thread after recent activity
	 */
	default_auto_archive_duration?: ThreadAutoArchiveDuration;
	/**
	 * The set of tags that can be used in a thread-only channel
	 */
	available_tags: APIGuildForumTag[];
	/**
	 * The initial `rate_limit_per_user` to set on newly created threads.
	 * This field is copied to the thread at creation time and does not live update
	 */
	default_thread_rate_limit_per_user?: number;
	/**
	 * The emoji to show in the add reaction button on a thread in a thread-only channel
	 */
	default_reaction_emoji: APIGuildForumDefaultReactionEmoji | null;
	/**
	 * The default sort order type used to order posts in a thread-only channel
	 */
	default_sort_order: SortOrderType | null;
}

export interface APIGuildForumChannel extends APIThreadOnlyChannel<ChannelType.GuildForum> {
	/**
	 * The default layout type used to display posts in a forum channel. Defaults to `0`, which indicates a layout view has not been set by a channel admin
	 */
	default_forum_layout: ForumLayoutType;
}

export type APIGuildMediaChannel = APIThreadOnlyChannel<ChannelType.GuildMedia>;

/**
 * https://discord.com/developers/docs/resources/channel#channel-object-channel-structure
 */
export type APIChannel =
	| APIDMChannel
	| APIGroupDMChannel
	| APIGuildCategoryChannel
	| APIGuildForumChannel
	| APIGuildMediaChannel
	| APIGuildStageVoiceChannel
	| APIGuildVoiceChannel
	| APINewsChannel
	| APITextChannel
	| APIThreadChannel;

/**
 * https://discord.com/developers/docs/resources/channel#channel-object-channel-types
 */
export enum ChannelType {
	/**
	 * A text channel within a guild
	 */
	GuildText,
	/**
	 * A direct message between users
	 */
	DM,
	/**
	 * A voice channel within a guild
	 */
	GuildVoice,
	/**
	 * A direct message between multiple users
	 */
	GroupDM,
	/**
	 * An organizational category that contains up to 50 channels
	 *
	 * See https://support.discord.com/hc/articles/115001580171
	 */
	GuildCategory,
	/**
	 * A channel that users can follow and crosspost into their own guild
	 *
	 * See https://support.discord.com/hc/articles/360032008192
	 */
	GuildAnnouncement,
	/**
	 * A temporary sub-channel within a Guild Announcement channel
	 */
	AnnouncementThread = 10,
	/**
	 * A temporary sub-channel within a Guild Text or Guild Forum channel
	 */
	PublicThread,
	/**
	 * A temporary sub-channel within a Guild Text channel that is only viewable by those invited and those with the Manage Threads permission
	 */
	PrivateThread,
	/**
	 * A voice channel for hosting events with an audience
	 *
	 * See https://support.discord.com/hc/articles/1500005513722
	 */
	GuildStageVoice,
	/**
	 * The channel in a Student Hub containing the listed servers
	 *
	 * See https://support.discord.com/hc/articles/4406046651927
	 */
	GuildDirectory,
	/**
	 * A channel that can only contain threads
	 */
	GuildForum,
	/**
	 * A channel like forum channels but contains media for server subscriptions
	 *
	 * See https://creator-support.discord.com/hc/articles/14346342766743
	 */
	GuildMedia,

	// EVERYTHING BELOW THIS LINE SHOULD BE OLD NAMES FOR RENAMED ENUM MEMBERS //

	/**
	 * A channel that users can follow and crosspost into their own guild
	 *
	 * @deprecated This is the old name for {@apilink ChannelType#GuildAnnouncement}
	 *
	 * See https://support.discord.com/hc/articles/360032008192
	 */
	GuildNews = 5,
	/**
	 * A temporary sub-channel within a Guild Announcement channel
	 *
	 * @deprecated This is the old name for {@apilink ChannelType#AnnouncementThread}
	 */
	// eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
	GuildNewsThread = 10,
	/**
	 * A temporary sub-channel within a Guild Text channel
	 *
	 * @deprecated This is the old name for {@apilink ChannelType#PublicThread}
	 */
	GuildPublicThread = 11,
	/**
	 * A temporary sub-channel within a Guild Text channel that is only viewable by those invited and those with the Manage Threads permission
	 *
	 * @deprecated This is the old name for {@apilink ChannelType#PrivateThread}
	 */
	GuildPrivateThread = 12,
}

export enum VideoQualityMode {
	/**
	 * Discord chooses the quality for optimal performance
	 */
	Auto = 1,
	/**
	 * 720p
	 */
	Full,
}

/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-structure
 */
export interface APIMessage {
	/**
	 * ID of the message
	 */
	id: Snowflake;
	/**
	 * ID of the channel the message was sent in
	 */
	channel_id: Snowflake;
	/**
	 * The author of this message (only a valid user in the case where the message is generated by a user or bot user)
	 *
	 * If the message is generated by a webhook, the author object corresponds to the webhook's id,
	 * username, and avatar. You can tell if a message is generated by a webhook by checking for the `webhook_id` property
	 *
	 * See https://discord.com/developers/docs/resources/user#user-object
	 */
	author: APIUser;
	/**
	 * Contents of the message
	 *
	 * The `MESSAGE_CONTENT` privileged gateway intent is required for verified applications to receive a non-empty value from this field
	 *
	 * In the Discord Developers Portal, you need to enable the toggle of this intent of your application in **Bot > Privileged Gateway Intents**.
	 * You also need to specify the intent bit value (`1 << 15`) if you are connecting to the gateway
	 *
	 * See https://support-dev.discord.com/hc/articles/4404772028055
	 */
	content: string;
	/**
	 * When this message was sent
	 */
	timestamp: string;
	/**
	 * When this message was edited (or null if never)
	 */
	edited_timestamp: string | null;
	/**
	 * Whether this was a TTS message
	 */
	tts: boolean;
	/**
	 * Whether this message mentions everyone
	 */
	mention_everyone: boolean;
	/**
	 * Users specifically mentioned in the message
	 *
	 * The `member` field is only present in `MESSAGE_CREATE` and `MESSAGE_UPDATE` events
	 * from text-based guild channels
	 *
	 * See https://discord.com/developers/docs/resources/user#user-object
	 * See https://discord.com/developers/docs/resources/guild#guild-member-object
	 */
	mentions: APIUser[];
	/**
	 * Roles specifically mentioned in this message
	 *
	 * See https://discord.com/developers/docs/topics/permissions#role-object
	 */
	mention_roles: APIRole['id'][];
	/**
	 * Channels specifically mentioned in this message
	 *
	 * Not all channel mentions in a message will appear in `mention_channels`.
	 * - Only textual channels that are visible to everyone in a lurkable guild will ever be included
	 * - Only crossposted messages (via Channel Following) currently include `mention_channels` at all
	 *
	 * If no mentions in the message meet these requirements, this field will not be sent
	 *
	 * See https://discord.com/developers/docs/resources/channel#channel-mention-object
	 */
	mention_channels?: APIChannelMention[];
	/**
	 * Any attached files
	 *
	 * See https://discord.com/developers/docs/resources/message#attachment-object-attachment-structure
	 *
	 * The `MESSAGE_CONTENT` privileged gateway intent is required for verified applications to receive a non-empty value from this field
	 *
	 * In the Discord Developers Portal, you need to enable the toggle of this intent of your application in **Bot > Privileged Gateway Intents**.
	 * You also need to specify the intent bit value (`1 << 15`) if you are connecting to the gateway
	 *
	 * See https://support-dev.discord.com/hc/articles/4404772028055
	 */
	attachments: APIAttachment[];
	/**
	 * Any embedded content
	 *
	 * See https://discord.com/developers/docs/resources/channel#embed-object
	 *
	 * The `MESSAGE_CONTENT` privileged gateway intent is required for verified applications to receive a non-empty value from this field
	 *
	 * In the Discord Developers Portal, you need to enable the toggle of this intent of your application in **Bot > Privileged Gateway Intents**.
	 * You also need to specify the intent bit value (`1 << 15`) if you are connecting to the gateway
	 *
	 * See https://support-dev.discord.com/hc/articles/4404772028055
	 */
	embeds: APIEmbed[];
	/**
	 * Reactions to the message
	 *
	 * See https://discord.com/developers/docs/resources/channel#reaction-object
	 */
	reactions?: APIReaction[];
	/**
	 * A nonce that can be used for optimistic message sending (up to 25 characters)
	 *
	 * **You will not receive this from further fetches. This is received only once from a `MESSAGE_CREATE`
	 * event to ensure it got sent**
	 */
	nonce?: number | string;
	/**
	 * Whether this message is pinned
	 */
	pinned: boolean;
	/**
	 * If the message is generated by a webhook, this is the webhook's id
	 */
	webhook_id?: Snowflake;
	/**
	 * Type of message
	 *
	 * See https://discord.com/developers/docs/resources/channel#message-object-message-types
	 */
	type: MessageType;
	/**
	 * Sent with Rich Presence-related chat embeds
	 *
	 * See https://discord.com/developers/docs/resources/channel#message-object-message-activity-structure
	 */
	activity?: APIMessageActivity;
	/**
	 * Sent with Rich Presence-related chat embeds
	 *
	 * See https://discord.com/developers/docs/resources/application#application-object
	 */
	application?: Partial<APIApplication>;
	/**
	 * If the message is a response to an Interaction, this is the id of the interaction's application
	 */
	application_id?: Snowflake;
	/**
	 * Reference data sent with crossposted messages, replies, pins, and thread starter messages
	 *
	 * See https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure
	 */
	message_reference?: APIMessageReference;
	/**
	 * Message flags combined as a bitfield
	 *
	 * See https://discord.com/developers/docs/resources/channel#message-object-message-flags
	 *
	 * See https://en.wikipedia.org/wiki/Bit_field
	 */
	flags?: MessageFlags;
	/**
	 * The message associated with the `message_reference`
	 *
	 * This field is only returned for messages with a `type` of `19` (REPLY).
	 *
	 * If the message is a reply but the `referenced_message` field is not present,
	 * the backend did not attempt to fetch the message that was being replied to,
	 * so its state is unknown.
	 *
	 * If the field exists but is `null`, the referenced message was deleted
	 *
	 * See https://discord.com/developers/docs/resources/channel#message-object
	 */
	referenced_message?: APIMessage | null;
	/**
	 * Sent if the message is sent as a result of an interaction
	 */
	interaction_metadata?: APIMessageInteractionMetadata;
	/**
	 * Sent if the message is a response to an Interaction
	 *
	 * @deprecated In favor of `interaction_metadata`
	 */
	interaction?: APIMessageInteraction;
	/**
	 * Sent if a thread was started from this message
	 */
	thread?: APIChannel;
	/**
	 * Sent if the message contains components like buttons, action rows, or other interactive components
	 *
	 * The `MESSAGE_CONTENT` privileged gateway intent is required for verified applications to receive a non-empty value from this field
	 *
	 * In the Discord Developers Portal, you need to enable the toggle of this intent of your application in **Bot > Privileged Gateway Intents**.
	 * You also need to specify the intent bit value (`1 << 15`) if you are connecting to the gateway
	 *
	 * See https://support-dev.discord.com/hc/articles/4404772028055
	 */
	components?: APIActionRowComponent<APIMessageActionRowComponent>[];
	/**
	 * Sent if the message contains stickers
	 *
	 * See https://discord.com/developers/docs/resources/sticker#sticker-item-object
	 */
	sticker_items?: APIStickerItem[];
	/**
	 * The stickers sent with the message
	 *
	 * See https://discord.com/developers/docs/resources/sticker#sticker-object
	 *
	 * @deprecated Use `sticker_items` instead
	 */
	stickers?: APISticker[];
	/**
	 * A generally increasing integer (there may be gaps or duplicates) that represents the approximate position of the message in a thread
	 *
	 * It can be used to estimate the relative position of the message in a thread in company with `total_message_sent` on parent thread
	 */
	position?: number;
	/**
	 * Data of the role subscription purchase or renewal that prompted this `ROLE_SUBSCRIPTION_PURCHASE` message
	 */
	role_subscription_data?: APIMessageRoleSubscriptionData;
	/**
	 * Data for users, members, channels, and roles in the message's auto-populated select menus
	 *
	 * See https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure
	 */
	resolved?: APIInteractionDataResolved;
	/**
	 * A poll!
	 *
	 * The `MESSAGE_CONTENT` privileged gateway intent is required for verified applications to receive a non-empty value from this field
	 *
	 * In the Discord Developers Portal, you need to enable the toggle of this intent of your application in **Bot > Privileged Gateway Intents**.
	 * You also need to specify the intent bit value (`1 << 15`) if you are connecting to the gateway
	 *
	 * See https://support-dev.discord.com/hc/articles/4404772028055
	 */
	poll?: APIPoll;
	/**
	 * The message associated with the message_reference. This is a minimal subset of fields in a message (e.g. author is excluded.)
	 */
	message_snapshots?: APIMessageSnapshot[];
	/**
	 * The call associated with the message
	 */
	call?: APIMessageCall;
}

/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-types
 */
export enum MessageType {
	Default,
	RecipientAdd,
	RecipientRemove,
	Call,
	ChannelNameChange,
	ChannelIconChange,
	ChannelPinnedMessage,
	UserJoin,
	GuildBoost,
	GuildBoostTier1,
	GuildBoostTier2,
	GuildBoostTier3,
	ChannelFollowAdd,

	GuildDiscoveryDisqualified = 14,
	GuildDiscoveryRequalified,
	GuildDiscoveryGracePeriodInitialWarning,
	GuildDiscoveryGracePeriodFinalWarning,
	ThreadCreated,
	Reply,
	ChatInputCommand,
	ThreadStarterMessage,
	GuildInviteReminder,
	ContextMenuCommand,
	AutoModerationAction,
	RoleSubscriptionPurchase,
	InteractionPremiumUpsell,
	StageStart,
	StageEnd,
	StageSpeaker,
	/**
	 * @unstable https://github.com/discord/discord-api-docs/pull/5927#discussion_r1107678548
	 */
	StageRaiseHand,
	StageTopic,
	GuildApplicationPremiumSubscription,

	GuildIncidentAlertModeEnabled = 36,
	GuildIncidentAlertModeDisabled,
	GuildIncidentReportRaid,
	GuildIncidentReportFalseAlarm,

	PurchaseNotification = 44,

	PollResult = 46,
}

/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-activity-structure
 */
export interface APIMessageActivity {
	/**
	 * Type of message activity
	 *
	 * See https://discord.com/developers/docs/resources/channel#message-object-message-activity-types
	 */
	type: MessageActivityType;
	/**
	 * `party_id` from a Rich Presence event
	 *
	 * See https://discord.com/developers/docs/rich-presence/how-to#updating-presence-update-presence-payload-fields
	 */
	party_id?: string;
}

/**
 * https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure
 */
export interface APIMessageReference {
	/**
	 * Type of reference
	 */
	type?: MessageReferenceType;
	/**
	 * ID of the originating message
	 */
	message_id?: Snowflake;
	/**
	 * ID of the originating message's channel
	 */
	channel_id: Snowflake;
	/**
	 * ID of the originating message's guild
	 */
	guild_id?: Snowflake;
}

/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-activity-types
 */
export enum MessageActivityType {
	Join = 1,
	Spectate,
	Listen,
	JoinRequest = 5,
}

/**
 * https://discord.com/developers/docs/resources/channel#message-reference-types
 */
export enum MessageReferenceType {
	/**
	 * A standard reference used by replies
	 */
	Default,
	/**
	 * Reference used to point to a message at a point in time
	 */
	Forward,
}

/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-flags
 */
export enum MessageFlags {
	/**
	 * This message has been published to subscribed channels (via Channel Following)
	 */
	Crossposted = 1 << 0,
	/**
	 * This message originated from a message in another channel (via Channel Following)
	 */
	IsCrosspost = 1 << 1,
	/**
	 * Do not include any embeds when serializing this message
	 */
	SuppressEmbeds = 1 << 2,
	/**
	 * The source message for this crosspost has been deleted (via Channel Following)
	 */
	SourceMessageDeleted = 1 << 3,
	/**
	 * This message came from the urgent message system
	 */
	Urgent = 1 << 4,
	/**
	 * This message has an associated thread, which shares its id
	 */
	HasThread = 1 << 5,
	/**
	 * This message is only visible to the user who invoked the Interaction
	 */
	Ephemeral = 1 << 6,
	/**
	 * This message is an Interaction Response and the bot is "thinking"
	 */
	Loading = 1 << 7,
	/**
	 * This message failed to mention some roles and add their members to the thread
	 */
	FailedToMentionSomeRolesInThread = 1 << 8,
	/**
	 * @unstable This message flag is currently not documented by Discord but has a known value which we will try to keep up to date.
	 */
	ShouldShowLinkNotDiscordWarning = 1 << 10,
	/**
	 * This message will not trigger push and desktop notifications
	 */
	SuppressNotifications = 1 << 12,
	/**
	 * This message is a voice message
	 */
	IsVoiceMessage = 1 << 13,
	/**
	 * This message has a snapshot (via Message Forwarding)
	 */
	HasSnapshot = 1 << 14,
}

/**
 * https://discord.com/developers/docs/resources/channel#message-call-object-message-call-object-structure
 */
export interface APIMessageCall {
	/**
	 * Array of user ids that participated in the call
	 */
	participants: Snowflake[];
	/**
	 * ISO8601 timestamp when the call ended
	 */
	ended_timestamp?: string | null;
}

/**
 * https://discord.com/developers/docs/resources/channel#role-subscription-data-object-role-subscription-data-object-structure
 */
export interface APIMessageRoleSubscriptionData {
	/**
	 * The id of the SKU and listing the user is subscribed to
	 */
	role_subscription_listing_id: Snowflake;
	/**
	 * The name of the tier the user is subscribed to
	 */
	tier_name: string;
	/**
	 * The number of months the user has been subscribed for
	 */
	total_months_subscribed: number;
	/**
	 * Whether this notification is for a renewal
	 */
	is_renewal: boolean;
}

/**
 * https://discord.com/developers/docs/resources/channel#followed-channel-object
 */
export interface APIFollowedChannel {
	/**
	 * Source channel id
	 */
	channel_id: Snowflake;
	/**
	 * Created target webhook id
	 */
	webhook_id: Snowflake;
}

/**
 * https://discord.com/developers/docs/resources/channel#reaction-object-reaction-structure
 */
export interface APIReaction {
	/**
	 * Total number of times this emoji has been used to react (including super reacts)
	 */
	count: number;
	/**
	 * An object detailing the individual reaction counts for different types of reactions
	 */
	count_details: APIReactionCountDetails;
	/**
	 * Whether the current user reacted using this emoji
	 */
	me: boolean;
	/**
	 * Whether the current user super-reacted using this emoji
	 */
	me_burst: boolean;
	/**
	 * Emoji information
	 *
	 * See https://discord.com/developers/docs/resources/emoji#emoji-object
	 */
	emoji: APIPartialEmoji;
	/**
	 * Hexadecimal colors used for this super reaction
	 */
	burst_colors: string[];
}

/**
 * https://discord.com/developers/docs/resources/channel#reaction-count-details-object-reaction-count-details-structure
 */
export interface APIReactionCountDetails {
	/**
	 * Count of super reactions
	 */
	burst: number;
	/**
	 * Count of normal reactions
	 */
	normal: number;
}

/**
 * https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure
 */
export interface APIOverwrite {
	/**
	 * Role or user id
	 */
	id: Snowflake;
	/**
	 * Either 0 (role) or 1 (member)
	 *
	 * {@link OverwriteType}
	 */
	type: OverwriteType;
	/**
	 * Permission bit set
	 *
	 * See https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
	 *
	 * See https://en.wikipedia.org/wiki/Bit_field
	 */
	allow: Permissions;
	/**
	 * Permission bit set
	 *
	 * See https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
	 *
	 * See https://en.wikipedia.org/wiki/Bit_field
	 */
	deny: Permissions;
}

export enum OverwriteType {
	Role,
	Member,
}

/**
 * https://discord.com/developers/docs/resources/channel#thread-metadata-object-thread-metadata-structure
 */
export interface APIThreadMetadata {
	/**
	 * Whether the thread is archived
	 */
	archived: boolean;
	/**
	 * Duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080
	 */
	auto_archive_duration: ThreadAutoArchiveDuration;
	/**
	 * An ISO8601 timestamp when the thread's archive status was last changed, used for calculating recent activity
	 */
	archive_timestamp: string;
	/**
	 * Whether the thread is locked; when a thread is locked, only users with `MANAGE_THREADS` can unarchive it
	 */
	locked: boolean;
	/**
	 * Whether non-moderators can add other non-moderators to the thread; only available on private threads
	 */
	invitable?: boolean;
	/**
	 * Timestamp when the thread was created; only populated for threads created after 2022-01-09
	 */
	create_timestamp?: string;
}

export enum ThreadAutoArchiveDuration {
	OneHour = 60,
	OneDay = 1_440,
	ThreeDays = 4_320,
	OneWeek = 10_080,
}

/**
 * https://discord.com/developers/docs/resources/channel#thread-member-object-thread-member-structure
 */
export interface APIThreadMember {
	/**
	 * The id of the thread
	 *
	 * **This field is omitted on the member sent within each thread in the `GUILD_CREATE` event**
	 */
	id?: Snowflake;
	/**
	 * The id of the member
	 *
	 * **This field is omitted on the member sent within each thread in the `GUILD_CREATE` event**
	 */
	user_id?: Snowflake;
	/**
	 * An ISO8601 timestamp for when the member last joined
	 */
	join_timestamp: string;
	/**
	 * Member flags combined as a bitfield
	 *
	 * See https://en.wikipedia.org/wiki/Bit_field
	 */
	flags: ThreadMemberFlags;
	/**
	 * Additional information about the user
	 *
	 * **This field is omitted on the member sent within each thread in the `GUILD_CREATE` event**
	 *
	 * **This field is only present when `with_member` is set to true when calling `List Thread Members` or `Get Thread Member`**
	 */
	member?: APIGuildMember;
}

export enum ThreadMemberFlags {
	/**
	 * @unstable This thread member flag is currently not documented by Discord but has a known value which we will try to keep up to date.
	 */
	HasInteracted = 1 << 0,
	/**
	 * @unstable This thread member flag is currently not documented by Discord but has a known value which we will try to keep up to date.
	 */
	AllMessages = 1 << 1,
	/**
	 * @unstable This thread member flag is currently not documented by Discord but has a known value which we will try to keep up to date.
	 */
	OnlyMentions = 1 << 2,
	/**
	 * @unstable This thread member flag is currently not documented by Discord but has a known value which we will try to keep up to date.
	 */
	NoMessages = 1 << 3,
}

export interface APIThreadList {
	/**
	 * The threads that were fetched
	 */
	threads: APIChannel[];
	/**
	 * The members for the client user in each of the fetched threads
	 */
	members: APIThreadMember[];
}

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-structure
 *
 * Length limit: 6000 characters
 */
export interface APIEmbed {
	/**
	 * Title of embed
	 *
	 * Length limit: 256 characters
	 */
	title?: string;
	/**
	 * Type of embed (always "rich" for webhook embeds)
	 */
	type?: EmbedType;
	/**
	 * Description of embed
	 *
	 * Length limit: 4096 characters
	 */
	description?: string;
	/**
	 * URL of embed
	 */
	url?: string;
	/**
	 * Timestamp of embed content
	 */
	timestamp?: string;
	/**
	 * Color code of the embed
	 */
	color?: number;
	/**
	 * Footer information
	 *
	 * See https://discord.com/developers/docs/resources/channel#embed-object-embed-footer-structure
	 */
	footer?: APIEmbedFooter;
	/**
	 * Image information
	 *
	 * See https://discord.com/developers/docs/resources/channel#embed-object-embed-image-structure
	 */
	image?: APIEmbedImage;
	/**
	 * Thumbnail information
	 *
	 * See https://discord.com/developers/docs/resources/channel#embed-object-embed-thumbnail-structure
	 */
	thumbnail?: APIEmbedThumbnail;
	/**
	 * Video information
	 *
	 * See https://discord.com/developers/docs/resources/channel#embed-object-embed-video-structure
	 */
	video?: APIEmbedVideo;
	/**
	 * Provider information
	 *
	 * See https://discord.com/developers/docs/resources/channel#embed-object-embed-provider-structure
	 */
	provider?: APIEmbedProvider;
	/**
	 * Author information
	 *
	 * See https://discord.com/developers/docs/resources/channel#embed-object-embed-author-structure
	 */
	author?: APIEmbedAuthor;
	/**
	 * Fields information
	 *
	 * Length limit: 25 field objects
	 *
	 * See https://discord.com/developers/docs/resources/channel#embed-object-embed-field-structure
	 */
	fields?: APIEmbedField[];
}

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-types
 */
export enum EmbedType {
	/**
	 * Generic embed rendered from embed attributes
	 */
	Rich = 'rich',
	/**
	 * Image embed
	 */
	Image = 'image',
	/**
	 * Video embed
	 */
	Video = 'video',
	/**
	 * Animated gif image embed rendered as a video embed
	 */
	GIFV = 'gifv',
	/**
	 * Article embed
	 */
	Article = 'article',
	/**
	 * Link embed
	 */
	Link = 'link',
	/**
	 * Auto moderation alert embed
	 *
	 * @unstable This embed type is currently not documented by Discord, but it is returned in the auto moderation system messages.
	 */
	AutoModerationMessage = 'auto_moderation_message',
	/**
	 * Poll result embed
	 */
	PollResult = 'poll_result',
}

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-thumbnail-structure
 */
export interface APIEmbedThumbnail {
	/**
	 * Source url of thumbnail (only supports http(s) and attachments)
	 */
	url: string;
	/**
	 * A proxied url of the thumbnail
	 */
	proxy_url?: string;
	/**
	 * Height of thumbnail
	 */
	height?: number;
	/**
	 * Width of thumbnail
	 */
	width?: number;
}

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-video-structure
 */
export interface APIEmbedVideo {
	/**
	 * Source url of video
	 */
	url?: string;
	/**
	 * A proxied url of the video
	 */
	proxy_url?: string;
	/**
	 * Height of video
	 */
	height?: number;
	/**
	 * Width of video
	 */
	width?: number;
}

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-image-structure
 */
export interface APIEmbedImage {
	/**
	 * Source url of image (only supports http(s) and attachments)
	 */
	url: string;
	/**
	 * A proxied url of the image
	 */
	proxy_url?: string;
	/**
	 * Height of image
	 */
	height?: number;
	/**
	 * Width of image
	 */
	width?: number;
}

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-provider-structure
 */
export interface APIEmbedProvider {
	/**
	 * Name of provider
	 */
	name?: string;
	/**
	 * URL of provider
	 */
	url?: string;
}

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-author-structure
 */
export interface APIEmbedAuthor {
	/**
	 * Name of author
	 *
	 * Length limit: 256 characters
	 */
	name: string;
	/**
	 * URL of author
	 */
	url?: string;
	/**
	 * URL of author icon (only supports http(s) and attachments)
	 */
	icon_url?: string;
	/**
	 * A proxied url of author icon
	 */
	proxy_icon_url?: string;
}

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-footer-structure
 */
export interface APIEmbedFooter {
	/**
	 * Footer text
	 *
	 * Length limit: 2048 characters
	 */
	text: string;
	/**
	 * URL of footer icon (only supports http(s) and attachments)
	 */
	icon_url?: string;
	/**
	 * A proxied url of footer icon
	 */
	proxy_icon_url?: string;
}

/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-field-structure
 */
export interface APIEmbedField {
	/**
	 * Name of the field
	 *
	 * Length limit: 256 characters
	 */
	name: string;
	/**
	 * Value of the field
	 *
	 * Length limit: 1024 characters
	 */
	value: string;
	/**
	 * Whether or not this field should display inline
	 */
	inline?: boolean;
}

/**
 * https://discord.com/developers/docs/resources/message#attachment-object-attachment-structure
 */
export interface APIAttachment {
	/**
	 * Attachment id
	 */
	id: Snowflake;
	/**
	 * Name of file attached
	 */
	filename: string;
	/**
	 * The title of the file
	 */
	title?: string;
	/**
	 * Description for the file
	 */
	description?: string;
	/**
	 * The attachment's media type
	 *
	 * See https://en.wikipedia.org/wiki/Media_type
	 */
	content_type?: string;
	/**
	 * Size of file in bytes
	 */
	size: number;
	/**
	 * Source url of file
	 */
	url: string;
	/**
	 * A proxied url of file
	 */
	proxy_url: string;
	/**
	 * Height of file (if image)
	 */
	height?: number | null;
	/**
	 * Width of file (if image)
	 */
	width?: number | null;
	/**
	 * Whether this attachment is ephemeral
	 */
	ephemeral?: boolean;
	/**
	 * The duration of the audio file (currently for voice messages)
	 */
	duration_secs?: number;
	/**
	 * Base64 encoded bytearray representing a sampled waveform (currently for voice messages)
	 */
	waveform?: string;
	/**
	 * Attachment flags combined as a bitfield
	 */
	flags?: AttachmentFlags;
}

/**
 * https://discord.com/developers/docs/resources/channel#attachment-object-attachment-structure-attachment-flags
 */
export enum AttachmentFlags {
	/**
	 * This attachment has been edited using the remix feature on mobile
	 */
	IsRemix = 1 << 2,
}

/**
 * https://discord.com/developers/docs/resources/channel#channel-mention-object-channel-mention-structure
 */
export interface APIChannelMention {
	/**
	 * ID of the channel
	 */
	id: Snowflake;
	/**
	 * ID of the guild containing the channel
	 */
	guild_id: Snowflake;
	/**
	 * The type of channel
	 *
	 * See https://discord.com/developers/docs/resources/channel#channel-object-channel-types
	 */
	type: ChannelType;
	/**
	 * The name of the channel
	 */
	name: string;
}

/**
 * https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mention-types
 */
export enum AllowedMentionsTypes {
	/**
	 * Controls @everyone and @here mentions
	 */
	Everyone = 'everyone',
	/**
	 * Controls role mentions
	 */
	Role = 'roles',
	/**
	 * Controls user mentions
	 */
	User = 'users',
}

/**
 * https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mentions-structure
 */
export interface APIAllowedMentions {
	/**
	 * An array of allowed mention types to parse from the content
	 *
	 * See https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mention-types
	 */
	parse?: AllowedMentionsTypes[];
	/**
	 * Array of role_ids to mention (Max size of 100)
	 */
	roles?: Snowflake[];
	/**
	 * Array of user_ids to mention (Max size of 100)
	 */
	users?: Snowflake[];
	/**
	 * 	For replies, whether to mention the author of the message being replied to (default false)
	 *
	 * @default false
	 */
	replied_user?: boolean;
}

/**
 * https://discord.com/developers/docs/interactions/message-components#component-object
 */
export interface APIBaseComponent<T extends ComponentType> {
	/**
	 * The type of the component
	 */
	type: T;
}

/**
 * https://discord.com/developers/docs/interactions/message-components#component-object-component-types
 */
export enum ComponentType {
	/**
	 * Action Row component
	 */
	ActionRow = 1,
	/**
	 * Button component
	 */
	Button,
	/**
	 * Select menu for picking from defined text options
	 */
	StringSelect,
	/**
	 * Text Input component
	 */
	TextInput,
	/**
	 * Select menu for users
	 */
	UserSelect,
	/**
	 * Select menu for roles
	 */
	RoleSelect,
	/**
	 * Select menu for users and roles
	 */
	MentionableSelect,
	/**
	 * Select menu for channels
	 */
	ChannelSelect,

	// EVERYTHING BELOW THIS LINE SHOULD BE OLD NAMES FOR RENAMED ENUM MEMBERS //

	/**
	 * Select menu for picking from defined text options
	 *
	 * @deprecated This is the old name for {@apilink ComponentType#StringSelect}
	 */
	SelectMenu = 3,
}

/**
 * https://discord.com/developers/docs/interactions/message-components#action-rows
 */
export interface APIActionRowComponent<T extends APIActionRowComponentTypes>
	extends APIBaseComponent<ComponentType.ActionRow> {
	/**
	 * The components in the ActionRow
	 */
	components: T[];
}

/**
 * https://discord.com/developers/docs/interactions/message-components#buttons
 */
export interface APIButtonComponentBase<Style extends ButtonStyle> extends APIBaseComponent<ComponentType.Button> {
	/**
	 * The label to be displayed on the button
	 */
	label?: string;
	/**
	 * The style of the button
	 */
	style: Style;
	/**
	 * The emoji to display to the left of the text
	 */
	emoji?: APIMessageComponentEmoji;
	/**
	 * The status of the button
	 */
	disabled?: boolean;
}

export interface APIMessageComponentEmoji {
	/**
	 * Emoji id
	 */
	id?: Snowflake;
	/**
	 * Emoji name
	 */
	name?: string;
	/**
	 * Whether this emoji is animated
	 */
	animated?: boolean;
}

export interface APIButtonComponentWithCustomId
	extends APIButtonComponentBase<
		ButtonStyle.Danger | ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success
	> {
	/**
	 * The custom_id to be sent in the interaction when clicked
	 */
	custom_id: string;
}

export interface APIButtonComponentWithURL extends APIButtonComponentBase<ButtonStyle.Link> {
	/**
	 * The URL to direct users to when clicked for Link buttons
	 */
	url: string;
}

export interface APIButtonComponentWithSKUId
	extends Omit<APIButtonComponentBase<ButtonStyle.Premium>, 'custom_id' | 'emoji' | 'label'> {
	/**
	 * The id for a purchasable SKU
	 */
	sku_id: Snowflake;
}

export type APIButtonComponent =
	| APIButtonComponentWithCustomId
	| APIButtonComponentWithSKUId
	| APIButtonComponentWithURL;

/**
 * https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
 */
export enum ButtonStyle {
	Primary = 1,
	Secondary,
	Success,
	Danger,
	Link,
	Premium,
}

/**
 * https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-styles
 */
export enum TextInputStyle {
	Short = 1,
	Paragraph,
}

/**
 * https://discord.com/developers/docs/interactions/message-components#select-menus
 */
export interface APIBaseSelectMenuComponent<
	T extends
		| ComponentType.ChannelSelect
		| ComponentType.MentionableSelect
		| ComponentType.RoleSelect
		| ComponentType.StringSelect
		| ComponentType.UserSelect,
> extends APIBaseComponent<T> {
	/**
	 * A developer-defined identifier for the select menu, max 100 characters
	 */
	custom_id: string;
	/**
	 * Custom placeholder text if nothing is selected, max 150 characters
	 */
	placeholder?: string;
	/**
	 * The minimum number of items that must be chosen; min 0, max 25
	 *
	 * @default 1
	 */
	min_values?: number;
	/**
	 * The maximum number of items that can be chosen; max 25
	 *
	 * @default 1
	 */
	max_values?: number;
	/**
	 * Disable the select
	 *
	 * @default false
	 */
	disabled?: boolean;
}

export interface APIBaseAutoPopulatedSelectMenuComponent<
	T extends
		| ComponentType.ChannelSelect
		| ComponentType.MentionableSelect
		| ComponentType.RoleSelect
		| ComponentType.UserSelect,
	D extends SelectMenuDefaultValueType,
> extends APIBaseSelectMenuComponent<T> {
	/**
	 * List of default values for auto-populated select menu components
	 */
	default_values?: APISelectMenuDefaultValue<D>[];
}

/**
 * https://discord.com/developers/docs/interactions/message-components#select-menus
 */
export interface APIStringSelectComponent extends APIBaseSelectMenuComponent<ComponentType.StringSelect> {
	/**
	 * Specified choices in a select menu; max 25
	 */
	options: APISelectMenuOption[];
}

/**
 * https://discord.com/developers/docs/interactions/message-components#select-menus
 */
export type APIUserSelectComponent = APIBaseAutoPopulatedSelectMenuComponent<
	ComponentType.UserSelect,
	SelectMenuDefaultValueType.User
>;

/**
 * https://discord.com/developers/docs/interactions/message-components#select-menus
 */
export type APIRoleSelectComponent = APIBaseAutoPopulatedSelectMenuComponent<
	ComponentType.RoleSelect,
	SelectMenuDefaultValueType.Role
>;

/**
 * https://discord.com/developers/docs/interactions/message-components#select-menus
 */
export type APIMentionableSelectComponent = APIBaseAutoPopulatedSelectMenuComponent<
	ComponentType.MentionableSelect,
	SelectMenuDefaultValueType.Role | SelectMenuDefaultValueType.User
>;

/**
 * https://discord.com/developers/docs/interactions/message-components#select-menus
 */
export interface APIChannelSelectComponent
	extends APIBaseAutoPopulatedSelectMenuComponent<ComponentType.ChannelSelect, SelectMenuDefaultValueType.Channel> {
	/**
	 * List of channel types to include in the ChannelSelect component
	 */
	channel_types?: ChannelType[];
}

/**
 * https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-default-value-structure
 */
export enum SelectMenuDefaultValueType {
	Channel = 'channel',
	Role = 'role',
	User = 'user',
}

/**
 * https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-default-value-structure
 */
export interface APISelectMenuDefaultValue<T extends SelectMenuDefaultValueType> {
	type: T;
	id: Snowflake;
}

export type APIAutoPopulatedSelectMenuComponent =
	| APIChannelSelectComponent
	| APIMentionableSelectComponent
	| APIRoleSelectComponent
	| APIUserSelectComponent;

/**
 * https://discord.com/developers/docs/interactions/message-components#select-menus
 */
export type APISelectMenuComponent =
	| APIChannelSelectComponent
	| APIMentionableSelectComponent
	| APIRoleSelectComponent
	| APIStringSelectComponent
	| APIUserSelectComponent;

/**
 * https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure
 */
export interface APISelectMenuOption {
	/**
	 * The user-facing name of the option (max 100 chars)
	 */
	label: string;
	/**
	 * The dev-defined value of the option (max 100 chars)
	 */
	value: string;
	/**
	 * An additional description of the option (max 100 chars)
	 */
	description?: string;
	/**
	 * The emoji to display to the left of the option
	 */
	emoji?: APIMessageComponentEmoji;
	/**
	 * Whether this option should be already-selected by default
	 */
	default?: boolean;
}

/**
 * https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-structure
 */
export interface APITextInputComponent extends APIBaseComponent<ComponentType.TextInput> {
	/**
	 * One of text input styles
	 */
	style: TextInputStyle;
	/**
	 * The custom id for the text input
	 */
	custom_id: string;
	/**
	 * Text that appears on top of the text input field, max 45 characters
	 */
	label: string;
	/**
	 * Placeholder for the text input
	 */
	placeholder?: string;
	/**
	 * The pre-filled text in the text input
	 */
	value?: string;
	/**
	 * Minimal length of text input
	 */
	min_length?: number;
	/**
	 * Maximal length of text input
	 */
	max_length?: number;
	/**
	 * Whether or not this text input is required or not
	 */
	required?: boolean;
}

/**
 * https://discord.com/developers/docs/resources/channel#message-snapshot-object
 */
export interface APIMessageSnapshot {
	/**
	 * Subset of the message object fields
	 */
	message: APIMessageSnapshotFields;
	/**
	 * Id of the origin message's guild
	 *
	 * @deprecated This field doesn't accurately reflect the Discord API as it doesn't exist nor is documented and will
	 * be removed in the next major version.
	 *
	 * It was added in {@link https://github.com/discord/discord-api-docs/pull/6833/commits/d18f72d06d62e6b1d51ca2c1ef308ddc29ff3348 | d18f72d}
	 * but was later removed before the PR ({@link https://github.com/discord/discord-api-docs/pull/6833 | discord-api-docs#6833}) was merged.
	 * See {@link https://github.com/discordjs/discord-api-types/pull/1084 | discord-api-types#1084} for more information.
	 */
	guild_id?: Snowflake;
}

/**
 * https://discord.com/developers/docs/resources/channel#channel-object-channel-flags
 */
export enum ChannelFlags {
	/**
	 * @unstable This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.
	 */
	GuildFeedRemoved = 1 << 0,
	/**
	 * This thread is pinned to the top of its parent forum channel
	 */
	Pinned = 1 << 1,
	/**
	 * @unstable This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.
	 */
	ActiveChannelsRemoved = 1 << 2,
	/**
	 * Whether a tag is required to be specified when creating a thread in a forum channel.
	 * Tags are specified in the `applied_tags` field
	 */
	RequireTag = 1 << 4,
	/**
	 * @unstable This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.
	 */
	IsSpam = 1 << 5,
	/**
	 * @unstable This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.
	 */
	IsGuildResourceChannel = 1 << 7,
	/**
	 * @unstable This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.
	 */
	ClydeAI = 1 << 8,
	/**
	 * @unstable This channel flag is currently not documented by Discord but has a known value which we will try to keep up to date.
	 */
	IsScheduledForDeletion = 1 << 9,
	/**
	 * Whether media download options are hidden.
	 */
	HideMediaDownloadOptions = 1 << 15,
}

/**
 * https://discord.com/developers/docs/interactions/message-components#message-components
 */
export type APIMessageComponent = APIActionRowComponent<APIMessageActionRowComponent> | APIMessageActionRowComponent;
export type APIModalComponent = APIActionRowComponent<APIModalActionRowComponent> | APIModalActionRowComponent;

export type APIActionRowComponentTypes = APIMessageActionRowComponent | APIModalActionRowComponent;

/**
 * https://discord.com/developers/docs/interactions/message-components#message-components
 */
export type APIMessageActionRowComponent = APIButtonComponent | APISelectMenuComponent;

// Modal components
export type APIModalActionRowComponent = APITextInputComponent;

export type APIMessageSnapshotFields = Pick<
	APIMessage,
	| 'attachments'
	| 'components'
	| 'content'
	| 'edited_timestamp'
	| 'embeds'
	| 'flags'
	| 'mention_roles'
	| 'mentions'
	| 'sticker_items'
	| 'stickers'
	| 'timestamp'
	| 'type'
>;
