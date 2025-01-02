export const webPage =
  process.env.WEB_PAGE || "";

export const conversationInput = `#text-input > div > div > div > div > div > div.or-web-text-input__input-focus-area > div > div`;

export const correctManageKnowledgeButton =
  "#app > main > div.rwc-history--active.rwc-history--resizable.rwc-history > div.rwc-history__wrapper > div > div.rwc-history-items > div.rwc-history-items__group > div.rwc-history-items__group-items > div > div > div > button";

export const continueButton = `#message-rwc-continue-conversation > div > div.rwc-message__inner > div > div > div > div > div > div.rwc-continue-conversation__action-buttons > button.or-web-button.typography-button.or-web-button--filled.or-web-button--nowrap`;

export const sendQuestionButton = `#text-input > div > div > div > div > div > div.rwc-base-text-input__buttons.theme-foreground-secondary.dark\:theme-foreground-secondary-dark > button.or-web-icon-button.message-text-input__send-btn.theme-foreground-primary.dark\:theme-foreground-primary-dark`;
