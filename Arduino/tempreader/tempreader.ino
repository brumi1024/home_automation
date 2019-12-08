#include <Sleep_n0m1.h>

#include <Printers.h>
#include <XBee.h>

#include <DallasTemperature.h>

#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>

#include <DHT.h>
#include <DHT_U.h>

/* Initialize IO pins */
#define DHTPIN 8
#define DHTTYPE DHT22
#define UV_OUT A0
#define REF_3V3 A1
#define XBEE_WAKE 9
#define BMP_SCK 13
#define BMP_MISO 12
#define BMP_MOSI 11
#define BMP_CS 10

/* Initialize variables for libraries */
Adafruit_BMP280 bmp(BMP_CS, BMP_MOSI, BMP_MISO,  BMP_SCK);
DHT_Unified dht(DHTPIN, DHTTYPE);
XBee xbee = XBee();
Sleep sleep;

unsigned long start = millis();
const unsigned long tenMinutes = 10 * 60 * 1000UL;

typedef struct {
  unsigned int id;
  float value;
} payload;


typedef union {
  payload payloadData;
  byte payloadBytes[sizeof(payload)];
} binaryPayload;

payload data;
binaryPayload dataToSend;

Tx16Request tx = Tx16Request(0x0001, dataToSend.payloadBytes, sizeof(dataToSend.payloadBytes));
TxStatusResponse txStatus = TxStatusResponse();

boolean startBmpTest() {
  if (!bmp.begin()) {
    prepareData(10, -1.0);
    sendData();
    return false;
  } else {
    return true;
  }
}

// Averages input reading
int averageAnalogRead(int pinToRead)
{
  byte numberOfReadings = 8;
  unsigned int runningValue = 0;

  for (int x = 0 ; x < numberOfReadings ; x++)
    runningValue += analogRead(pinToRead);
  runningValue /= numberOfReadings;

  return (runningValue);
}

// Arduino default mapping function for floats
float mapfloat(float x, float in_min, float in_max, float out_min, float out_max)
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// Reads input voltage from ML8511 and maps it to the UV radiation range
float readUvSensor() {
  int uvLevel = averageAnalogRead(UV_OUT);
  int refLevel = averageAnalogRead(REF_3V3);

  float outputVoltage = 3.3 / refLevel * uvLevel;
  float uvIntensity = mapfloat(outputVoltage, 0.99, 2.8, 0.0, 15.0);

  return outputVoltage;
}

void prepareData(int id, float value) {
  data.id = id;
  data.value = value;
  dataToSend.payloadData = data;
}

void sendData() {
  xbee.send(tx);

  if (xbee.readPacket(5000)) {
    if (xbee.getResponse().getApiId() == TX_STATUS_RESPONSE) {
      xbee.getResponse().getTxStatusResponse(txStatus);
    }
  }
}

void sendSensorData() {
  if (startBmpTest()) {
    prepareData(0, bmp.readTemperature());
    sendData();
    delay(750);
    prepareData(1, bmp.readPressure());
    sendData();
  }
  sensors_event_t event;
  dht.temperature().getEvent(&event);
  if (isnan(event.temperature)) {
    prepareData(12, -1.0);
    sendData();
  } else {
    prepareData(2, event.temperature);
    sendData();
  }
  delay(750);
  dht.humidity().getEvent(&event);
  if (isnan(event.relative_humidity)) {
    prepareData(13, -1.0);
    sendData();
  } else {
    prepareData(3, event.relative_humidity);
    sendData();
  }
  delay(750);
  float outputVoltage = readUvSensor();
  prepareData(4, mapfloat(outputVoltage, 0.99, 2.8, 0.0, 15.0));
  sendData();
  delay(750);
  prepareData(5, outputVoltage);
  sendData();
}

void setup() {
  Serial.begin(9600);
  
  dht.begin();

  // ML8511 UV
  pinMode(UV_OUT, INPUT);
  pinMode(REF_3V3, INPUT);

  // Xbee
  xbee.setSerial(Serial);
}

void loop() {
  if (millis() - start > 15000) {

    pinMode(XBEE_WAKE, OUTPUT);
    digitalWrite(XBEE_WAKE, LOW);
    sendSensorData();
    pinMode(XBEE_WAKE, INPUT); // put pin in a high impedence state
    digitalWrite(XBEE_WAKE, HIGH);
    sleep.pwrDownMode(); // Set sleep mode
    sleep.sleepDelay(tenMinutes);

  }
}
