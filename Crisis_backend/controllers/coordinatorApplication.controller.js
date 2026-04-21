const coordinatorApplicationService = require('../services/coordinatorApplication.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc   Submit a new coordinator application
// @route  POST /api/coordinator-applications
// @access Public
const submitApplication = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Document proof is required. Please upload a PDF, JPG, or PNG file.');
    }

    const applicationData = {
      ...req.body,
      documentProof: req.file.path.replace(/\\/g, '/'), // normalize path separators
    };

    // Parse skills if sent as JSON string (from FormData)
    if (typeof applicationData.skills === 'string') {
      try {
        applicationData.skills = JSON.parse(applicationData.skills);
      } catch {
        applicationData.skills = [];
      }
    }

    const result = await coordinatorApplicationService.createApplication(applicationData);
    return successResponse(res, 201, 'Coordinator application submitted successfully. An admin will review your documents.', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get all coordinator applications
// @route  GET /api/coordinator-applications?status=pending&page=1&limit=20
// @access Admin
const getApplications = async (req, res) => {
  try {
    const result = await coordinatorApplicationService.getAllApplications(req.query);
    return successResponse(res, 200, 'Applications fetched', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Get a single coordinator application
// @route  GET /api/coordinator-applications/:id
// @access Admin
const getApplicationById = async (req, res) => {
  try {
    const result = await coordinatorApplicationService.getApplicationById(req.params.id);
    return successResponse(res, 200, 'Application fetched', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// @desc   Approve or reject a coordinator application
// @route  PATCH /api/coordinator-applications/:id/review
// @access Admin
const reviewApplication = async (req, res) => {
  try {
    const result = await coordinatorApplicationService.reviewApplication(
      req.params.id,
      req.user,
      req.body
    );
    return successResponse(res, 200, result.message, result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = { submitApplication, getApplications, getApplicationById, reviewApplication };
