#! /usr/bin/python

import serial
import struct
import time
from xbee import XBee

serial_port = serial.Serial('/dev/serial0', 9600)


def xbeeError(error):
    print ('{"XBeeError":' + error + '}')


def isNaN(num):
    return num != num


def receiveMessage(data):
    """
    This method is called whenever data is received
    from the associated XBee device. Its first and
    only argument is the data contained within the
    frame.
    """
    rf = data['rf_data']
    if len(rf) == 6:
        id = struct.unpack('H', data['rf_data'][0:2])[0]
        value = struct.unpack('f', data['rf_data'][2:6])[0]
        if not isNaN(id) and not isNaN(value):
            print '{"id":' + str(id) + ', "value":' + str(value) + '}';


xbee = XBee(serial_port, callback=receiveMessage, error_callback=xbeeError)

while True:
    try:
        time.sleep(0.001)
    except KeyboardInterrupt:
        break

xbee.halt()
serial_port.close()
