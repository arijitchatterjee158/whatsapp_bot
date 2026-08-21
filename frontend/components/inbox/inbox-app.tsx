"use client";

import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  Info,
  Menu,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Send,
  Smile,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  type Conversation,
  type Message,
} from "./types";

import {
  getConversations,
  getMessages,
  login,
  sendWhatsAppMessage,
} from "@/lib/api";

import {
  connectSocket,
} from "@/lib/socket";

/* =========================================================
   AVATAR
========================================================= */

function Avatar({
  conversation,
  size = "default",
}: {
  conversation: Pick<
    Conversation,
    "initials" | "avatarTone"
  >;
  size?: "small" | "default" | "large";
}) {
  const sizes = {
    small: "size-9 text-xs",
    default: "size-10 text-sm",
    large: "size-12 text-base",
  };

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizes[size]} ${conversation.avatarTone}`}
    >
      {conversation.initials}
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function LoginView({
  onLogin,
}: {
  onLogin: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(
        email,
        password
      );

      localStorage.setItem(
        "accessToken",
        data.token
      );

      onLogin();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-foreground/5 md:grid-cols-[0.95fr_1.05fr]">

        <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15">
              <Sparkles className="size-5" />
            </div>

            <span className="font-semibold tracking-tight">
              ReplyDesk
            </span>
          </div>

          <div className="max-w-sm">
            <p className="mb-5 text-sm font-medium text-primary-foreground/70">
              BUSINESS MESSAGING, SIMPLIFIED
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              Every customer conversation,
              in one calm place.
            </h1>

            <p className="mt-5 leading-7 text-primary-foreground/70">
              Connect your WhatsApp Business
              account and give your team the
              context they need to respond
              faster.
            </p>
          </div>

          <p className="text-sm text-primary-foreground/60">
            Trusted by modern support teams
          </p>
        </div>

        <div className="p-7 sm:p-12">

          <div className="mb-10 flex items-center gap-3 md:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>

            <span className="font-semibold tracking-tight">
              ReplyDesk
            </span>
          </div>

          <p className="mb-3 text-sm font-medium text-primary">
            WELCOME BACK
          </p>

          <h2 className="text-3xl font-semibold tracking-tight">
            Sign in to your inbox
          </h2>

          <p className="mt-3 leading-6 text-muted-foreground">
            Pick up where your team left off.
          </p>

          <form
            className="mt-8 flex flex-col gap-5"
            onSubmit={handleSubmit}
          >

            <label className="flex flex-col gap-2 text-sm font-medium">
              Work email

              <input
                required
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@company.com"
                className="h-11 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Password

              <input
                required
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="••••••••"
                className="h-11 rounded-lg border border-input bg-background px-3 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full"
            >
              {loading
                ? "Signing in..."
                : "Sign in to ReplyDesk"}
            </Button>

          </form>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   MAP CONVERSATION
========================================================= */

function mapConversation(
  item: any
): Conversation {
  const contact = item.contactId;

  const name =
    contact?.name ||
    contact?.phone ||
    "Unknown";

  const initials = name
    .split(" ")
    .map(
      (part: string) =>
        part.charAt(0)
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: item._id,

    name,

    phone:
      contact?.phone || "",

    initials,

    avatarTone:
      "bg-secondary text-secondary-foreground",

    lastMessage:
      item.lastMessage || "",

    timestamp: item.lastMessageAt
      ? new Date(
          item.lastMessageAt
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",

    unread: 0,

    online: false,

    messages: [],
  };
}

/* =========================================================
   MAP MESSAGE
========================================================= */

function mapMessage(
  item: any
): Message {
  return {
    id: item._id || item.id,

    /*
     * Keep the WhatsApp message ID separately from
     * the MongoDB message _id.
     *
     * WhatsApp status webhooks identify the message
     * using whatsappMessageId.
     */
    whatsappMessageId:
      item.whatsappMessageId,

    text:
      item.text || "",

    time: item.timestamp
      ? new Date(
          item.timestamp
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : item.time || "",

    direction:
      item.direction ===
      "outbound"
        ? "outgoing"
        : "incoming",

    /*
     * Cast here because the current shared Message
     * type may not yet contain "delivered".
     * We are intentionally keeping this change
     * inside inbox-app.tsx only.
     */
    status:
      item.status === "read"
        ? "read"
        : item.status === "delivered"
        ? "delivered"
        : item.status === "sent"
        ? "sent"
        : "received",
  } as Message;
}

/* =========================================================
   CONVERSATION ROW
========================================================= */

function ConversationRow({
  conversation,
  selected,
  onSelect,
}: {
  conversation: Conversation;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-accent/60 ${
        selected ? "bg-accent" : ""
      }`}
    >
      <Avatar
        conversation={conversation}
      />

      <span className="min-w-0 flex-1">

        <span className="flex items-center justify-between gap-2">

          <span className="truncate text-sm font-semibold">
            {conversation.name}
          </span>

          <span className="shrink-0 text-[11px] text-muted-foreground">
            {conversation.timestamp}
          </span>

        </span>

        <span className="mt-1 flex items-center justify-between gap-2">

          <span className="truncate text-xs text-muted-foreground">
            {conversation.lastMessage}
          </span>

          {conversation.unread > 0 && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {conversation.unread}
            </span>
          )}

        </span>

      </span>
    </button>
  );
}

/* =========================================================
   CONVERSATION LIST
========================================================= */

function ConversationList({
  conversations,
  selectedId,
  onSelect,
  className = "",
}: {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const [query, setQuery] =
    useState("");

  const filtered =
    conversations.filter(
      (conversation) =>
        `${conversation.name} ${conversation.phone}`
          .toLowerCase()
          .includes(
            query.toLowerCase()
          )
    );

  return (
    <aside
      className={`flex min-h-0 w-full flex-col border-r border-border bg-card md:w-[340px] md:shrink-0 ${className}`}
    >

      <div className="flex items-center justify-between px-5 pb-4 pt-5">

        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Inbox
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            {conversations.length} conversations
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="rounded-lg"
        >
          <Plus />
        </Button>

      </div>

      <div className="px-4 pb-4">

        <div className="flex h-10 items-center gap-2 rounded-lg bg-muted/70 px-3 text-muted-foreground">

          <Search className="size-4" />

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search conversations"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />

        </div>

      </div>

      <div className="flex items-center gap-2 px-4 pb-3">

        <Button
          size="sm"
          className="rounded-full px-3"
        >
          All

          <span className="ml-1 text-primary-foreground/70">
            {conversations.length}
          </span>
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="rounded-full px-3 text-muted-foreground"
        >
          Unread
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="ml-auto size-8"
        >
          <ChevronDown />
        </Button>

      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-border pt-1">

        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No conversations found.
          </div>
        ) : (
          filtered.map(
            (conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={
                  conversation
                }
                selected={
                  selectedId ===
                  conversation.id
                }
                onSelect={() =>
                  onSelect(
                    conversation.id
                  )
                }
              />
            )
          )
        )}

      </div>

    </aside>
  );
}

/* =========================================================
   MESSAGE BUBBLE
========================================================= */

function MessageBubble({
  message,
}: {
  message: Message;
}) {
  const outgoing =
    message.direction ===
    "outgoing";

  return (
    <div
      className={`flex ${
        outgoing
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
          outgoing
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border bg-card"
        }`}
      >

        <p>{message.text}</p>

        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
            outgoing
              ? "text-primary-foreground/65"
              : "text-muted-foreground"
          }`}
        >

          <span>
            {message.time}
          </span>

          {outgoing && (() => {
            const status =
              message.status as string;

            if (status === "read") {
              return (
                <CheckCheck className="size-3.5 text-blue-500" />
              );
            }

            if (status === "delivered") {
              return (
                <CheckCheck className="size-3.5" />
              );
            }

            return (
              <Check className="size-3.5" />
            );
          })()}

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   MESSAGE COMPOSER
========================================================= */

function MessageComposer({
  onSend,
  sending,
}: {
  onSend: (
    text: string
  ) => Promise<void>;
  sending: boolean;
}) {
  const [text, setText] =
    useState("");

  const send = async () => {
    const value = text.trim();

    if (!value || sending) {
      return;
    }

    await onSend(value);

    setText("");
  };

  return (
    <div className="border-t border-border bg-card p-4">

      <div className="flex items-end gap-2 rounded-xl border border-input bg-background p-2 shadow-sm">

        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 text-muted-foreground"
          disabled={sending}
        >
          <Paperclip />
        </Button>

        <textarea
          value={text}
          disabled={sending}
          onChange={(event) =>
            setText(event.target.value)
          }
          onKeyDown={async (event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();

              await send();
            }
          }}
          placeholder={
            sending
              ? "Sending..."
              : "Write a message..."
          }
          rows={1}
          className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none disabled:opacity-50"
        />

        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 text-muted-foreground"
          disabled={sending}
        >
          <Smile />
        </Button>

        <Button
          size="icon"
          className="size-9 shrink-0 rounded-lg"
          onClick={send}
          disabled={
            sending ||
            !text.trim()
          }
        >
          {sending ? (
            <span className="text-xs">
              ...
            </span>
          ) : (
            <Send />
          )}
        </Button>

      </div>

    </div>
  );
}

/* =========================================================
   CHAT WINDOW
========================================================= */

function ChatWindow({
  conversation,
  onBack,
  onSend,
  loadingMessages,
  sending,
  className = "",
}: {
  conversation: Conversation;
  onBack: () => void;
  onSend: (
    text: string
  ) => Promise<void>;
  loadingMessages: boolean;
  sending: boolean;
  className?: string;
}) {
  return (
    <section
      className={`flex min-h-0 flex-1 flex-col bg-muted/30 ${className}`}
    >

      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6">

        <div className="flex min-w-0 items-center gap-3">

          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 size-9 md:hidden"
            onClick={onBack}
          >
            <ArrowLeft />
          </Button>

          <Avatar
            conversation={conversation}
            size="small"
          />

          <div className="min-w-0">

            <h2 className="truncate text-sm font-semibold">
              {conversation.name}
            </h2>

            <p className="truncate text-xs text-muted-foreground">
              {conversation.phone}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-1">

          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground"
          >
            <Info />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground"
          >
            <MoreHorizontal />
          </Button>

        </div>

      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">

        <div className="mx-auto flex max-w-3xl flex-col gap-3">

          <div className="mb-3 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">

            <span className="h-px flex-1 bg-border" />

            <span>Messages</span>

            <span className="h-px flex-1 bg-border" />

          </div>

          {loadingMessages ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading messages...
            </div>
          ) : conversation.messages
              .length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No messages yet.
            </div>
          ) : (
            conversation.messages.map(
              (message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                />
              )
            )
          )}

        </div>

      </div>

      <MessageComposer
        onSend={onSend}
        sending={sending}
      />

    </section>
  );
}

/* =========================================================
   INBOX SHELL
========================================================= */

function InboxShell() {
  const [selectedId, setSelectedId] =
    useState("");

  const [showList, setShowList] =
    useState(true);

  const [items, setItems] =
    useState<Conversation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [sendError, setSendError] =
    useState("");

  /* =======================================================
     LOAD CONVERSATIONS
  ======================================================= */

  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getConversations();

        const mapped =
          (
            data.conversations ||
            []
          ).map(
            mapConversation
          );

        setItems(mapped);

        if (mapped.length > 0) {
          setSelectedId(
            mapped[0].id
          );
        }
      } catch (error) {
        console.error(
          "Failed to load conversations:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load conversations"
        );
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, []);

  /* =======================================================
     LOAD MESSAGES
  ======================================================= */

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    async function loadMessages() {
      try {
        setLoadingMessages(true);

        const data =
          await getMessages(
            selectedId
          );

        const messages =
          (
            data.messages ||
            []
          ).map(mapMessage);

        setItems((current) =>
          current.map(
            (conversation) =>
              conversation.id ===
              selectedId
                ? {
                    ...conversation,
                    messages,
                  }
                : conversation
          )
        );
      } catch (error) {
        console.error(
          "Failed to load messages:",
          error
        );
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();
  }, [selectedId]);

  /* =======================================================
     SOCKET.IO REAL-TIME MESSAGES

     IMPORTANT:
     Backend emits:

       new-message

     So frontend MUST listen to exactly
     the same event name.
  ======================================================= */

  useEffect(() => {
    let socket:
      | ReturnType<typeof connectSocket>
      | null = null;

    try {
      socket = connectSocket();

      console.log(
        "Frontend Socket.IO listener initialized"
      );

      const handleNewMessage = (
        payload: any
      ) => {
        console.log(
          "========== NEW REAL-TIME MESSAGE =========="
        );

        console.log(
          payload
        );

        console.log(
          "============================================"
        );

        const incomingMessage =
          payload?.message;

        if (!incomingMessage) {
          console.warn(
            "Socket message received without message data"
          );

          return;
        }

        const conversationId =
          incomingMessage.conversationId;

        if (!conversationId) {
          console.warn(
            "Socket message does not contain conversationId"
          );

          return;
        }

        const message =
          mapMessage(
            incomingMessage
          );

        setItems(
          (currentItems) => {
            const conversation =
              currentItems.find(
                (item) =>
                  item.id ===
                  conversationId
              );

            if (!conversation) {
              console.warn(
                "Conversation not found in current inbox:",
                conversationId
              );

              return currentItems;
            }

            /*
             * Prevent duplicate messages.
             */

            const alreadyExists =
              conversation.messages?.some(
                (existingMessage: any) =>
                  existingMessage.id ===
                  message.id
              );

            if (alreadyExists) {
              return currentItems;
            }

            const isCurrentConversation =
              conversationId ===
              selectedId;

            const updatedConversation =
              {
                ...conversation,

                messages: [
                  ...(conversation.messages ||
                    []),
                  message,
                ],

                lastMessage:
                  message.text,

                timestamp:
                  message.time,

                unread:
                  isCurrentConversation
                    ? 0
                    : (conversation.unread ||
                        0) + 1,
              };

            /*
             * Move updated conversation
             * to the top of inbox.
             */

            return [
              updatedConversation,

              ...currentItems.filter(
                (item) =>
                  item.id !==
                  conversationId
              ),
            ];
          }
        );
      };

      /*
       * IMPORTANT:
       *
       * This MUST match backend:
       *
       * whatsapp:new-message
       */

      socket.on(
        "new_message",
        handleNewMessage
      );

      /*
       * WhatsApp delivery status updates.
       *
       * Backend emits the WhatsApp status using the
       * message_status Socket.IO event.
       *
       * Payload supported by this handler:
       * {
       *   whatsappMessageId: "wamid...",
       *   status: "sent" | "delivered" | "read"
       * }
       */
      const handleMessageStatus = (
        payload: any
      ) => {
        console.log(
          "========== WHATSAPP MESSAGE STATUS =========="
        );
        console.log(
          "Socket status payload:",
          payload
        );
        console.log(
          "=============================================="
        );

        const whatsappMessageId =
          payload?.whatsappMessageId ||
          payload?.messageId ||
          payload?.id;

        const status =
          payload?.status;

        if (!whatsappMessageId) {
          console.warn(
            "Status update missing whatsappMessageId:",
            payload
          );
          return;
        }

        if (
          status !== "sent" &&
          status !== "delivered" &&
          status !== "read"
        ) {
          console.warn(
            "Ignoring unsupported WhatsApp status:",
            status
          );
          return;
        }

        setItems((currentItems) =>
          currentItems.map(
            (conversation) => ({
              ...conversation,
              messages: conversation.messages.map(
                (message: any) => {
                  if (
                    message.whatsappMessageId ===
                    whatsappMessageId
                  ) {
                    return {
                      ...message,
                      status,
                    };
                  }

                  return message;
                }
              ),
            })
          )
        );
      };

      socket.on(
        "message_status_updated",
        handleMessageStatus
      );

      return () => {
        console.log(
          "Removing frontend Socket.IO listener"
        );

        socket?.off(
          "new_message",
          handleNewMessage
        );

        socket?.off(
          "message_status_updated",
          handleMessageStatus
        );

        /*
         * DO NOT disconnect here.
         *
         * The socket should remain connected
         * when selected conversation changes.
         */
      };
    } catch (error) {
      console.error(
        "Socket initialization failed:",
        error
      );
    }
  }, []);

  const selected =
    items.find(
      (conversation) =>
        conversation.id ===
        selectedId
    ) ?? items[0];

  /* =======================================================
     SELECT CONVERSATION
  ======================================================= */

  const handleSelect = (
    id: string
  ) => {
    setSelectedId(id);

    setSendError("");

    if (
      typeof window !==
        "undefined" &&
      window.matchMedia(
        "(max-width: 767px)"
      ).matches
    ) {
      setShowList(false);
    }

    setItems((current) =>
      current.map(
        (conversation) =>
          conversation.id === id
            ? {
                ...conversation,
                unread: 0,
              }
            : conversation
      )
    );
  };

  /* =======================================================
     SEND WHATSAPP MESSAGE
  ======================================================= */

  const handleSend = async (
    text: string
  ) => {
    if (!selected) {
      return;
    }

    try {
      setSending(true);
      setSendError("");

      /*
       * Actual API:
       *
       * POST
       * /api/whatsapp/conversations/:id/messages
       *
       * sendWhatsAppMessage() handles the
       * request body.
       */

      const data =
        await sendWhatsAppMessage(
          selected.id,
          text
        );

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   message: "Message sent successfully",
       *   data: {
       *     whatsappMessageId: "...",
       *     message: {...}
       *   }
       * }
       */

      const backendMessage =
        data?.data?.message;

      if (!backendMessage) {
        throw new Error(
          "Message was sent but backend did not return the saved message"
        );
      }

      const message =
        mapMessage(
          backendMessage
        );

      setItems((current) =>
        current.map(
          (conversation) =>
            conversation.id ===
            selected.id
              ? {
                  ...conversation,

                  lastMessage:
                    message.text,

                  timestamp:
                    message.time,

                  messages: [
                    ...conversation.messages,
                    message,
                  ],
                }
              : conversation
        )
      );
    } catch (error) {
      console.error(
        "Failed to send WhatsApp message:",
        error
      );

      setSendError(
        error instanceof Error
          ? error.message
          : "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex h-dvh items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading conversations...
        </p>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="flex h-dvh items-center justify-center">

        <div className="text-center">

          <p className="text-sm text-destructive">
            {error}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Please check your backend
            and login session.
          </p>

        </div>

      </main>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (items.length === 0) {
    return (
      <main className="flex h-dvh items-center justify-center">
        <p className="text-sm text-muted-foreground">
          No conversations yet.
        </p>
      </main>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="flex h-dvh min-h-[600px] flex-col bg-background">

      {/* HEADER */}

      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">

        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            size="icon"
            className="size-9 md:hidden"
            onClick={() =>
              setShowList(true)
            }
          >
            <Menu />
          </Button>

          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>

          <div>

            <p className="text-sm font-semibold tracking-tight">
              ReplyDesk
            </p>

            <p className="hidden text-[11px] text-muted-foreground sm:block">
              WhatsApp Business inbox
            </p>

          </div>

        </div>

        <div className="flex items-center gap-1">

          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground"
          >
            <Bell />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground"
          >
            <CircleHelp />
          </Button>

          <div className="ml-2 flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
            JD
          </div>

        </div>

      </header>

      {/* CONTENT */}

      <div className="flex min-h-0 flex-1">

        {showList && (
          <ConversationList
            conversations={items}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        )}

        {selected && (
          <div className="relative flex min-h-0 flex-1">

            <ChatWindow
              className={
                showList
                  ? "hidden md:flex"
                  : "flex"
              }
              conversation={selected}
              onBack={() =>
                setShowList(true)
              }
              onSend={handleSend}
              loadingMessages={
                loadingMessages
              }
              sending={sending}
            />

            {sendError && (
              <div className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive shadow-md">
                {sendError}
              </div>
            )}

          </div>
        )}

      </div>

    </main>
  );
}

/* =========================================================
   ROOT
========================================================= */

export default function InboxApp() {
  const [loggedIn, setLoggedIn] =
    useState(false);

  return loggedIn ? (
    <InboxShell />
  ) : (
    <LoginView
      onLogin={() =>
        setLoggedIn(true)
      }
    />
  );
}