const HttpError = require("../models/http-error");

const roleAdmin = (req, res, next) => {
  if (req.userData.role === "Admin") {
    next();
  } else {
    return next(new HttpError("Access Denied", 403));
  }
};

const roleCashier = (req, res, next) => {
  if (req.userData.role === "Cashier") {
    next();
  } else {
    return next(new HttpError("Access Denied", 403));
  }
};

module.exports = { roleAdmin, roleCashier };
