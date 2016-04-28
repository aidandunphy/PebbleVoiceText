#include <pebble.h>

static Window *s_main_window;
static TextLayer *s_output_layer;

static DictationSession *s_dictation_session;
static char s_last_text[512];
static char status[7];
static char errorText[100];

typedef enum {
  voiceTextKeyStatus = 0,
  voiceTextKeyErrorText = 1,
  voiceTextKeyDestination = 2,  
  voiceTextKeyMessage = 3
} voiceTextKey;

static void in_received_handler(DictionaryIterator *iter, void *context) {
  Tuple *status_tuple = dict_find(iter, voiceTextKeyStatus);
  Tuple *errorText_tuple = dict_find(iter, voiceTextKeyErrorText);

  if (status_tuple) {
    strncpy(status, status_tuple->value->cstring, 7);
    text_layer_set_text(s_output_layer, status);
  }
  if (errorText_tuple) {
    strncpy(errorText, errorText_tuple->value->cstring, 100);
    text_layer_set_text(s_output_layer, errorText);
  }
}

static void in_dropped_handler(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Dropped!");
}

static void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Failed to Send!");
}

static void handle_message(char *destination, char *message) {
  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);
  dict_write_cstring(iter, voiceTextKeyDestination, destination);
  dict_write_cstring(iter, voiceTextKeyMessage, message);
  app_message_outbox_send();
}

static void dictation_session_callback(DictationSession *session, DictationSessionStatus status, char *transcription, void *context) {
  if(status == DictationSessionStatusSuccess) {
    snprintf(s_last_text, sizeof(s_last_text), "I think you said:\n\n%s", transcription);
    text_layer_set_text(s_output_layer, s_last_text);
    char destination [] = "447970911539";
    char *pdestination = &destination[0];
    handle_message(pdestination, transcription);
  } else {
    static char s_failed_buff[128];
    snprintf(s_failed_buff, sizeof(s_failed_buff), "Sorry I couldn't understand that.\n\nError ID:\n%d", (int)status);
    text_layer_set_text(s_output_layer, s_failed_buff);
  }
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
  // dictation_session_start(s_dictation_session);
  char message [] = "blah";
  char *pmessage = &message[0];
  char destination [] = "447970911539";
  char *pdestination = &destination[0];
  handle_message(destination, pmessage);
}

static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  s_output_layer = text_layer_create(GRect(bounds.origin.x, (bounds.size.h - 24) / 2, bounds.size.w, bounds.size.h));
  text_layer_set_text(s_output_layer, "Press select then speak");
  text_layer_set_text_alignment(s_output_layer, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(s_output_layer));
}

static void window_unload(Window *window) {
  text_layer_destroy(s_output_layer);
}

static void init() {

  app_message_register_inbox_received(in_received_handler);
  app_message_register_inbox_dropped(in_dropped_handler);
  app_message_register_outbox_failed(out_failed_handler);

  s_main_window = window_create();
  window_set_click_config_provider(s_main_window, click_config_provider);
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  window_stack_push(s_main_window, true);

  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());

  // Create new dictation session
  // s_dictation_session = dictation_session_create(sizeof(s_last_text), dictation_session_callback, NULL);
  // dictation_session_enable_confirmation(s_dictation_session, 0);
}

static void deinit() {
  dictation_session_destroy(s_dictation_session);
  window_destroy(s_main_window);
}

int main() {
  init();
  app_event_loop();
  deinit();
}
