#include <FastLED.h>
#include <ArduinoJson.h>

#define NUM_LEDS 20
#define DATA_PIN 6
#define VERSION "0.0.1"

CRGB leds[NUM_LEDS];

String mode = "off";

void setup() {
  Serial.begin(9600);
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);
  JsonDocument json;
  json["ok"] = true;
  json["version"] = VERSION;
  json["hardware"] = "xf-oac";
  serializeJson(json, Serial);
  Serial.println();
}

void loop() {
  if (Serial.available()) {
    StaticJsonDocument<200> doc;
    String teststr = Serial.readString();  //read until timeout
    teststr.trim();                        // remove any \r \n whitespace at the end of the String
    Serial.println("Recv:"+teststr);
    DeserializationError error = deserializeJson(doc, teststr);
    if (error) {
      Serial.println("{\"error\":\"deserializeJson() failed\"}");
      return;
    }
    if (strcmp(doc["mode"], "static") == 0) {
      Serial.println("mode=static");
      // leds[0] = CRGB::Red;
      fill_solid (leds, NUM_LEDS, CRGB(doc["r"],doc["g"],doc["b"]));
      // if(doc.containsKey("brightness"))FastLED.setBrightness(uint8_t(doc["brightness"]*255.0));
      FastLED.show();
    }
    if (strcmp(doc["mode"], "off") == 0) {
      fill_solid (leds, NUM_LEDS, CRGB::Black);
      FastLED.show();
    }
  }  //wait for data available
  delay(100);
}

// void loop() {
//   leds[0] = CRGB::White;
//   FastLED.show();
//   delay(30);
//   leds[0] = CRGB::Black;
//   FastLED.show();
//   delay(30);
// }