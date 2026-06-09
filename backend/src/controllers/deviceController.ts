import { Request, Response } from "express";

import {
  createDeviceService,
  getDevicesService,
  getDeviceByIdService,
  updateDeviceService,
  deleteDeviceService,
  attachDeviceToCourseService,
  getDevicesByCourseService,
  detachDeviceFromCourseService
} from "../services/deviceService.js";

export async function createDeviceController(
  req: Request,
  res: Response
) {
  try {
    const result = await createDeviceService(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message
    });
  }
}

export async function getDevicesController(
  req: Request,
  res: Response
) {
  try {
    const result = await getDevicesService();

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message
    });
  }
}

export async function getDeviceByIdController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const result = await getDeviceByIdService(
      Number(id)
    );

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message
    });
  }
}

export async function updateDeviceController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const result = await updateDeviceService(
      Number(id),
      req.body
    );

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message
    });
  }
}

export async function deleteDeviceController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const result = await deleteDeviceService(
      Number(id)
    );

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message
    });
  }
}

export async function attachDeviceToCourseController(
  req: Request,
  res: Response
) {
  try {
    const {
      courseId,
      deviceId
    } = req.params;

    const result = await attachDeviceToCourseService(
      Number(courseId),
      Number(deviceId)
    );

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message
    });
  }
}

export async function getDevicesByCourseController(
  req: Request,
  res: Response
) {
  try {
    const { courseId } = req.params;

    const result = await getDevicesByCourseService(
      Number(courseId)
    );

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message
    });
  }
}

export async function detachDeviceFromCourseController(
  req: Request,
  res: Response
) {
  try {
    const {
      courseId,
      deviceId
    } = req.params;

    const result = await detachDeviceFromCourseService(
      Number(courseId),
      Number(deviceId)
    );

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message
    });
  }
}