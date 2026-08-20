import axios, { AxiosInstance } from "axios";

import { env } from "../config/env";

class MetaClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: "https://graph.facebook.com",
      headers: {
        Authorization: `Bearer ${env.meta.accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string
  ) {
    const response = await this.client.post(
      `/${env.meta.phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
        },
      }
    );

    return response.data;
  }

  async sendTextMessage(
    to: string,
    message: string
  ) {
    const response = await this.client.post(
      `/${env.meta.phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }
    );

    return response.data;
  }
}

export const metaClient = new MetaClient();