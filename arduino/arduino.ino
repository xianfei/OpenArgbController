#include <FastLED.h>
#include <ArduinoJson.h>

#define NUM_LEDS 8
#define DATA_PIN 6
#define VERSION "0.0.1"

CRGB leds[NUM_LEDS];

void setup() {
  Serial.begin(9600);
  FastLED.addLeds<WS2812B, DATA_PIN>(leds, NUM_LEDS);
  Serial.println("{\"ok\":2}");

}

void loop() {
  if (Serial.available()) {
    String teststr = Serial.readString();  //read until timeout
    teststr.trim();                        // remove any \r \n whitespace at the end of the String
    if (teststr == "red") {
      Serial.println("A primary color");
    } else {
      Serial.println("{\"ok\":1}");
    }
  }  //wait for data available
}

// void loop() {
//   leds[0] = CRGB::White;
//   FastLED.show();
//   delay(30);
//   leds[0] = CRGB::Black;
//   FastLED.show();
//   delay(30);
// }