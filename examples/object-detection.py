import airsim

# connect to the AirSim simulator
client = airsim.VehicleClient()
client.confirmConnection()

# set camera name and image type to request images and detections
camera_name = "0"
image_type = airsim.ImageType.Scene

# set detection radius in [cm]
client.simSetDetectionFilterRadius(camera_name, image_type, 200 * 100) 
# add desired object name to detect in wild card/regex format
client.simAddDetectionFilterMeshName(camera_name, image_type, "Cylinder*") 

cylinders = client.simGetDetections(camera_name, image_type)

if cylinders:
  for cylinder in cylinders:
    s = pprint.pformat(cylinder)
    print("Cylinder: %s" % s)