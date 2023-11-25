const express = require("express");
const route = express.Router();
// const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const axios = require("axios");
const qs = require("qs");
const cheerio = require("cheerio");
const path = require("path");

route.post("/downloadFile", async (req, res) => {
  // const dynamicUrl = req.body.url;
  try {
    const result = await fetchAndProcessDataNew(req.body.url);
    res.send({ parsedData: result.data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function fetchAndProcessDataNew(url) {
  try {
    const options = {
      method: "GET",
      url: process.env.REQ_URL,
      params: {
        url: url,
      },
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_KEY,
        "X-RapidAPI-Host": process.env.RAPID_HOST,
      },
    };

    try {
      const response = await axios.request(options);
      return response;
      // console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = route;
