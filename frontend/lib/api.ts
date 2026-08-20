// lib/api.ts

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

/* =========================================================
   TYPES
========================================================= */

export interface LoginResponse {
  success: boolean;
  token: string;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface ConversationResponse {
  success: boolean;
  conversations: any[];
}

export interface MessagesResponse {
  success: boolean;
  conversationId: string;
  messages: any[];
}

/* =========================================================
   AUTH HEADER
========================================================= */

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

/* =========================================================
   LOGIN
========================================================= */

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Login failed"
    );
  }

  return data;
}

/* =========================================================
   REGISTER
========================================================= */

export async function register(
  name: string,
  email: string,
  password: string
) {
  const response = await fetch(
    `${API_URL}/api/auth/register`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Registration failed"
    );
  }

  return data;
}

/* =========================================================
   GET CONVERSATIONS
========================================================= */

export async function getConversations(): Promise<ConversationResponse> {
  const response = await fetch(
    `${API_URL}/api/whatsapp/conversations`,
    {
      method: "GET",

      headers: getAuthHeaders(),

      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load conversations"
    );
  }

  return data;
}

/* =========================================================
   GET MESSAGES
========================================================= */

export async function getMessages(
  conversationId: string
): Promise<MessagesResponse> {
  const response = await fetch(
    `${API_URL}/api/whatsapp/conversations/${conversationId}/messages`,
    {
      method: "GET",

      headers: getAuthHeaders(),

      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load messages"
    );
  }

  return data;
}

/* =========================================================
   SAVE WHATSAPP CONFIGURATION
========================================================= */

export async function saveWhatsAppConfig(
  config: {
    wabaId: string;
    phoneNumberId: string;
    businessPhoneNumber: string;
  }
) {
  const response = await fetch(
    `${API_URL}/api/whatsapp/config`,
    {
      method: "POST",

      headers: getAuthHeaders(),

      body: JSON.stringify(config),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to save WhatsApp configuration"
    );
  }

  return data;
}

/* =========================================================
   GET WHATSAPP CONFIGURATION
========================================================= */

export async function getWhatsAppConfig() {
  const response = await fetch(
    `${API_URL}/api/whatsapp/config`,
    {
      method: "GET",

      headers: getAuthHeaders(),

      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load WhatsApp configuration"
    );
  }

  return data;
}

/* =========================================================
   SEND WHATSAPP MESSAGE
========================================================= */

export async function sendWhatsAppMessage(
  conversationId: string,
  text: string
) {
  const response = await fetch(
    `${API_URL}/api/whatsapp/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        message: text,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to send WhatsApp message"
    );
  }

  return data;
}

/* =========================================================
   LOGOUT
========================================================= */

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(
      "accessToken"
    );
  }
}

/* =========================================================
   GET TOKEN
========================================================= */

export function getToken(): string | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  return localStorage.getItem(
    "accessToken"
  );
}