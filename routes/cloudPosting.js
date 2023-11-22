const express = require("express");
const route = express.Router();
// const fetch = require("node-fetch");
const axios = require("axios");
const http = require("http");
const puppeteer = require("puppeteer");
// const chromium = require("chrome-aws-lambda");
const cloudinary = require("cloudinary").v2;

const acceptedExtensions = ["jpg", "jpeg", "png", "gif"];

const NodeCache = require("node-cache"); // You'll need to install this package
const uploadCache = new NodeCache(); // Initialize an upload cache

//downloading from cloudinary
route.post("/downloadVid", async (req, res) => {
  const { videoURL, videoThumbnail } = req.body;
  console.log(req.body);

  // Generate a unique cache key based on the input data
  const cacheKey = `${videoURL}-${videoThumbnail}`;

  try {
    // Check if the upload result is already cached
    const cachedResult = uploadCache.get(cacheKey);

    if (cachedResult) {
      console.log("Upload result retrieved from cache");
      res.send(cachedResult);
      return;
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadResult = await cloudinary.uploader.upload(videoURL, {
      resource_type: "video",
    });

    // Upload video thumbnail to Cloudinary
    const uploadThumbnailResult = await cloudinary.uploader.upload(
      videoThumbnail,
      {
        resource_type: "image",
      }
    );

    const cloudinaryVideoURL = uploadResult.secure_url;
    const cloudinaryVideoThumbnailURL = uploadThumbnailResult.secure_url;

    const result = {
      cloudinaryVideoURL,
      cloudinaryVideoThumbnailURL,
    };

    // Cache the upload result for future use
    uploadCache.set(
      cacheKey,
      result /* set your desired cache expiration time in seconds */
    );

    res.send(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//normal one
route.post("/downloadVid1", async (req, res) => {
  const { videoURL, videoThumbnail } = req.body;
  console.log(req.body);
  try {
    const result = {
      cloudinaryVideoURL: videoURL,
      cloudinaryVideoThumbnailURL: videoThumbnail,
    };

    res.send(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

route.post("/downloadReel", async (req, res) => {
  const { videoURL } = req.body;
  console.log(req.body);

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadedLinks = [];

    for (const item of videoURL) {
      let videoUrl, displayUrl;

      if ("video_versions" in item) {
        videoUrl = item.video_versions[0].url;
        displayUrl = item.image_versions2.candidates[0].url || item.display_url;
      } else {
        videoUrl = item.video_url;
        displayUrl = item.display_url;
      }
      // if ("video_versions" in item) {
      //   videoUrl = item.video_versions;
      //   displayUrl = item.image_versions2 || item.display_url;
      // } else {
      //   videoUrl = item.video_url;
      //   displayUrl = item.display_url;
      // }

      if (videoUrl) {
        // Upload video to Cloudinary
        const videoUploadResult = await cloudinary.uploader.upload(videoUrl, {
          resource_type: "video",
        });

        // Upload thumbnail to Cloudinary
        const thumbnailUploadResult = await cloudinary.uploader.upload(
          displayUrl,
          {
            resource_type: "image",
          }
        );

        // Push the online links to the uploadedLinks array
        uploadedLinks.push({
          cloudinaryVideoURL: videoUploadResult.secure_url,
          cloudinaryThumbnailURL: thumbnailUploadResult.secure_url,
        });
      } else {
        // Treat it as an image upload if video_versions is missing
        const imageUploadResult = await cloudinary.uploader.upload(displayUrl, {
          resource_type: "image",
        });

        uploadedLinks.push({
          cloudinaryVideoURL: imageUploadResult.secure_url,
          cloudinaryThumbnailURL: imageUploadResult.secure_url,
        });
      }
    }

    res.json({ uploadedLinks });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

route.post("/downloadImg", async (req, res) => {
  const { videoURL, videoThumbnail } = req.body;

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    // Upload video thumbnail to Cloudinary
    const uploadThumbnailResult = await cloudinary.uploader.upload(
      videoThumbnail,
      {
        resource_type: "image",
      }
    );
    // const cloudinaryVideoURL = uploadResult.secure_url;
    const cloudinaryVideoThumbnailURL = uploadThumbnailResult.secure_url;

    res.send({
      // cloudinaryVideoURL,
      cloudinaryVideoThumbnailURL,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

route.post("/deleteVid", async (req, res) => {
  const { videoURL, videoThumbnailURL } = req.body;

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Extract public_ids from the URLs
    const videoPublicId = extractPublicId(videoURL);
    const thumbnailPublicId = extractPublicId(videoThumbnailURL);

    // Delete video from Cloudinary
    await cloudinary.uploader.destroy(videoPublicId, {
      resource_type: "video",
    });

    // Delete thumbnail from Cloudinary
    await cloudinary.uploader.destroy(thumbnailPublicId, {
      resource_type: "image",
    });

    res.json({ message: "Deletion successful" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper function to extract public_id from Cloudinary URL
function extractPublicId(url) {
  const startIndex = url.lastIndexOf("/") + 1;
  const endIndex = url.lastIndexOf(".");
  return url.substring(startIndex, endIndex);
}

module.exports = route;
