// src/data/aedsCurriculum.js
//
// Static reference data ONLY — no backend, no database, no API route
// behind this. It exists purely to populate the Activity dropdown on
// AdminPanel's Workbook Completion tab (and the "+ Add all curriculum
// activities" shortcut there). Nothing reads or writes this at runtime
// except that one component; it's bundled with the frontend like any
// other constant.
//
// Grades 4-9: activity names only (topic left blank) — pulled from the
// AEDS workbook's WORKSHEETS sheet, one activity per row, in teaching
// order. Grades 10-12: topic + activity pairs, exactly as supplied.
//
// To change what's offered in the dropdown, edit this file directly —
// there's nothing to re-seed or re-deploy beyond shipping the new file.

export default {
  "Grade 4": [
    { order: 1, topic: "", activity: "ACTIVITY 1- BIKE INDICATOR CIRCUIT" },
    { order: 2, topic: "", activity: "ACTIVITY 2- BLENDER MACHINE" },
    { order: 3, topic: "", activity: "ACTIVTY 3- HANDSHAKE ACTIVITY" },
    { order: 4, topic: "", activity: "ACTIVITY 4- SECURITY ALARM" },
    { order: 5, topic: "", activity: "ACTIVITY 5- MONITORING THE FREEZER TEMPERATURE" },
    { order: 6, topic: "", activity: "ACTIVITY 6- DOOR OPEN DETECTION" },
    { order: 7, topic: "", activity: "ACTIVITY 7- WATER DISPENSER" },
    { order: 8, topic: "", activity: "ACTIVITY 8- LINE FOLLOWER BOT" },
    { order: 9, topic: "", activity: "ACTIVITY 9- PRICK THE BALLON" },
    { order: 10, topic: "", activity: "ACTIVITY 10- DETECTING OBJECT USING AI" },
  ],
  "Grade 5": [
    { order: 1, topic: "", activity: "ACTIVITY 1- SAFETY CONVEYOR SYSTEM" },
    { order: 2, topic: "", activity: "ACTIVITY 2- FIRE DETECTING ALARM" },
    { order: 3, topic: "", activity: "ACTIVITY 3- WATER LEVEL INDICATOR" },
    { order: 4, topic: "", activity: "ACTIVITY 4- TOUCH LAMP" },
    { order: 5, topic: "", activity: "ACTIVITY 5 - SMART TOUCH CAR" },
    { order: 6, topic: "", activity: "ACTIVITY 6- LOW MOISTURE INDICATOR" },
    { order: 7, topic: "", activity: "ACTIVITY 7- SMART PLANTING SYSTEM" },
    { order: 8, topic: "", activity: "ACTIVITY 8- HUMAN FOLLOWING BOT" },
    { order: 9, topic: "", activity: "ACTIVITY 9- CAT IN THE MAZE" },
    { order: 10, topic: "", activity: "ACTIVITY 10- SMART AI CHATBOT" },
  ],
  "Grade 6": [
    { order: 1, topic: "", activity: "ACTIVITY 1- BLINKING AN LED" },
    { order: 2, topic: "", activity: "ACTIVITY 2- INTERFACING PUSH BUTTON WITH AN LED" },
    { order: 3, topic: "", activity: "ACTIVITY 3- LED CHASER CIRCUIT" },
    { order: 4, topic: "", activity: "ACTIVITY 4- SECURITY ALARM" },
    { order: 5, topic: "", activity: "ACTIVIYTY 5- FRIDGE DOOR ALARM" },
    { order: 6, topic: "", activity: "ACTIVITY 6- CLASSROOM NOISE INDICATOR" },
    { order: 7, topic: "", activity: "ACTIVITY 7- RAIN DETECTION SYSTEM" },
    { order: 8, topic: "", activity: "ACTIVITY 8- RAY ROVER" },
    { order: 9, topic: "", activity: "ACTIVITY 9- SMART MATH- AN ARITHMETIC QUIZ" },
    { order: 10, topic: "", activity: "ACTIVITY 10- VOICEMATE- A SIMPLE VOICE ASSISTANT" },
  ],
  "Grade 7": [
    { order: 1, topic: "", activity: "ACTIVITY 1- SIREN" },
    { order: 2, topic: "", activity: "ACTIVITY 2- DIGITAL PROTRACTOR" },
    { order: 3, topic: "", activity: "ACTIVITY 3- BATTERY LEVEL INDICATOR" },
    { order: 4, topic: "", activity: "ACTIVITY 4- EARTHQUAKE ALARM" },
    { order: 5, topic: "", activity: "ACTIVITY 5- PRINT DATE & DAY" },
    { order: 6, topic: "", activity: "ACTIVITY 6- NOISE POLLUTION MONITOR" },
    { order: 7, topic: "", activity: "ACTIVITY 7- HIFI COUNTER WITH IR SENSOR" },
    { order: 8, topic: "", activity: "ACTIVITY 8- LINE FOLLOWER BOT" },
    { order: 9, topic: "", activity: "ACTIVITY 9- AI BASED ROCK PAPER SCISSORS GAME" },
    { order: 10, topic: "", activity: "ACTIVITY 10- AI POWERED VOICE ASSISTANT FOR WEATHER & TIME" },
  ],
  "Grade 8": [
    { order: 1, topic: "", activity: "ACTIVITY 1-ROOM TEMPERTAURE MONITORING SYSTEM" },
    { order: 2, topic: "", activity: "ACTIVITY 2- WEATHER MONITORING SYSTEM" },
    { order: 3, topic: "", activity: "ACTIVITY 3- AUTOMATIC TEMPERATURE CONTROLLING SYSTEM" },
    { order: 4, topic: "", activity: "ACTIVITY 4- DIGITAL SCALE" },
    { order: 5, topic: "", activity: "ACTIVITY 5- SMART WATER LEVEL MONITORING SYSTEM" },
    { order: 6, topic: "", activity: "ACTIVITY 6- AUTOMATIC SPEED CONTROLLER IN VEHICLES" },
    { order: 7, topic: "", activity: "ACTIVITY 7- AUTOMATIC DOOR OPENER" },
    { order: 8, topic: "", activity: "ACTIVITY 8- HUMAN FOLLOWER BOT" },
    { order: 9, topic: "", activity: "ACTIVITY 9- NUMBER GUESSING GAME" },
    { order: 10, topic: "", activity: "ACTIVITY 10- GRAMMAR CORRECTION CHATBOT" },
  ],
  "Grade 9": [
    { order: 1, topic: "", activity: "ACTIVITY 1-U-TURN FINDER" },
    { order: 2, topic: "", activity: "ACTIVITY 2- MONITORING AIRCRAFT ORIENTATION" },
    { order: 3, topic: "", activity: "ACTIVITY 3- WATER BOTTLE FILLING MACHINE" },
    { order: 4, topic: "", activity: "ACTIVITY 4- DUAL FLOOR S LIFT SYSTEM" },
    { order: 5, topic: "", activity: "ACTIVITY 5- AUTOMATIC WATER SPRINKLER SYSTEM" },
    { order: 6, topic: "", activity: "ACTIVITY 6- WEATHER MONITORING CHATBOT" },
    { order: 7, topic: "", activity: "ACTIVITY 7- IOT CONTROLLED BOT" },
    { order: 8, topic: "", activity: "ACTIVITY 8- GESTURE CONTROLLED BOT" },
    { order: 9, topic: "", activity: "ACTIVITY 9- FACE RECOGNITION DOOR LOCK" },
    { order: 10, topic: "", activity: "ACTIVITY 10- AI MOTION-ACTIVATED CAMERA" },
  ],
  "Grade 10": [
    { order: 1, topic: "Introduction to Microcontroller", activity: "" },
    { order: 2, topic: "Introduction to LDR", activity: "Activity 1: Prototype – Stair Case Light Control System" },
    { order: 3, topic: "Introduction to IR sensor", activity: "Activity 2: Prototype – Automatic street light control" },
    { order: 4, topic: "Introduction to MQ6 Gas Sensor", activity: "Activity 3: Prototype – Gas Shutdown system" },
    { order: 5, topic: "Introduction to RFID", activity: "Activity 4: Prototype – RFID Based Attendance System" },
    { order: 6, topic: "Introduction to GSM Module", activity: "Activity 5: Prototype – GSM Based book finder system" },
    { order: 7, topic: "Introduction to Ultrasonic sensor", activity: "Activity 6: Cleaning bot" },
    { order: 8, topic: "Introduction to ESP8266", activity: "Activity 7- IOT-Based Garbage Monitoring System" },
    { order: 9, topic: "Introduction to Flame Sensor", activity: "Activity 8: IOT Based Fire Detection System" },
    { order: 10, topic: "Introduction to AI", activity: "Activity 9- AI Fire Detection and Alarm System using Arduino" },
    { order: 11, topic: "Introduction to AI", activity: "Activity 10-AI-Based Smart Attendance System with Face Recognition" },
  ],
  "Grade 11": [
    { order: 1, topic: "Introduction to Microcontroller", activity: "" },
    { order: 2, topic: "Introduction to Ultrasonic sensor", activity: "Activity 1: Prototype – Blind Stick using ultrasonic sensor" },
    { order: 3, topic: "Introduction to Soil Moisture sensor", activity: "Activity 2: Prototype – Smart Irrigation system" },
    { order: 4, topic: "Introduction to Current sensor", activity: "Activity 3: Prototype – DC current monitoring sensor" },
    { order: 5, topic: "Introduction to DHT-11", activity: "Activity 4: Prototype – Temperature Monitoring system" },
    { order: 6, topic: "Introduction to IR sensor", activity: "Activity 5: Prototype – Automatic car parking system" },
    { order: 7, topic: "Introduction to 4x4 Matrix keypad", activity: "Activity 6: Prototype – Matrix keypad calculator" },
    { order: 8, topic: "Introduction to Vibration sensor", activity: "Activity 7: Earthquake Prevention System with IOT" },
    { order: 9, topic: "Introduction to Flame sensor", activity: "Activity 8: IOT based fire fighter" },
    { order: 10, topic: "Introduction to Python", activity: "Activity 9: Emotion Triggered Light system" },
    { order: 11, topic: "Introduction to Python", activity: "Activity 10: Voice controlled home automation" },
  ],
  "Grade 12": [
    { order: 1, topic: "Introduction to Microcontroller", activity: "" },
    { order: 2, topic: "Introduction to Ultrasonic sensor", activity: "Activity 1: Prototype – Accident Prevention system" },
    { order: 3, topic: "Introduction to LDR", activity: "Activity 2: Prototype – Automatic solar tracking using LDR" },
    { order: 4, topic: "Introduction to ESP32", activity: "Activity 3: Prototype – Wireless Calling bell system" },
    { order: 5, topic: "Introduction to MQ6", activity: "Activity 4: Prototype – Toxic Gas Detection system for bore well" },
    { order: 6, topic: "Introduction to RFID Module", activity: "Activity 5: Prototype – Smart billing system with RFID" },
    { order: 7, topic: "Introduction to MPU6050", activity: "Activity 6: Prototype – Arduino Gimbal Using MPU6050" },
    { order: 8, topic: "Introduction to Current sensor", activity: "Activity 7: Over Load Cutoff system" },
    { order: 9, topic: "Introduction to Soil moisture sensor", activity: "Activity 8: Irrigation Bot" },
    { order: 10, topic: "Introduction to AI", activity: "Activity 9: AI-Face based access Indicator using Open CV and Arduino" },
    { order: 11, topic: "Introduction to AI", activity: "Activity 10: AI based face tracking system" },
  ],
};