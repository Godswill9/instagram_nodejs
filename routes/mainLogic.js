const express = require("express");
const route = express.Router();
// const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const axios = require("axios");
const qs = require("qs");
const cheerio = require("cheerio");
const path = require("path");
const { executablePath } = require("puppeteer");

const NodeCache = require("node-cache"); // You'll need to install this package
const dataCache = new NodeCache(); // Initialize a data cache

var userAgent =
  "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36";

function dynamic_url_maker(url) {
  let dynamicUrl = url;
  const check_url = dynamicUrl.replace(/ /g, "");
  if (check_url === "") {
  } else {
    const re =
      /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
    if (!re.test(check_url)) {
      // show_snackbar(0);
      return "error_link";
    }
    let n = dynamicUrl.split("");
    let dynamic_url = "";
    let slash = 0;
    let i;
    for (i = 0; i < n.length; i++) {
      if (n[i] == "/") {
        slash += 1;
      }
      dynamic_url += n[i];
      if (slash == 5) {
        break;
      }
    }
    dynamicUrl = dynamic_url + "?__a=1&__d=dis";
    return dynamicUrl;
  }
}
route.post("/downloadAnotherWay", async (req, res) => {
  try {
    const postUrl = dynamic_url_maker(req.body.url); // Get the Instagram post URL from the query parameters
    console.log(postUrl);
    const headers = {
      // 'Authorization': `Bearer ${apiKey}`, // Replace 'Bearer' with your authentication method, e.g., 'Basic', 'Token'
      "User-Agent": userAgent, // Set your custom User-Agent here
    };

    const { data } = await axios.get(postUrl, { headers });
    if (!data) {
      console.log("bad");
    } else {
      res.send(data);
      console.log(data);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
});

// route.post("/downloadFile", async (req, res) => {
//   const dynamicUrl = dynamic_url_maker(req.body.url);
//   console.log(dynamicUrl);

//   try {
//     const { parsedData } = await fetchAndProcessData(dynamicUrl, userAgent);

//     res.send({ parsedData });
//     console.log("Sent data successfully.");
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       error: "Internal server error",
//       dynamicUrl: dynamicUrl,
//     });
//   }
// });

route.post("/downloadFile", async (req, res) => {
  const dynamicUrl = dynamic_url_maker(req.body.url);

  console.log(dynamicUrl);
  // const dynamicUrl = req.body.url;
  try {
    const { parsedData } = await fetchAndProcessData(dynamicUrl);
    // const { parsedData } = await fetchHtmlContent(dynamicUrl);

    res.send({ parsedData });
    console.log("sent oo");
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", dynamicUrl: dynamicUrl });
  }
});

// async function fetchAndProcessData(url) {
//   try {
//     // Check if the data is already cached
//     const cachedData = dataCache.get(url);

//     if (cachedData) {
//       console.log("Data retrieved from cache");
//       return { parsedData: cachedData };
//     }

//     // const dataset = {
//     //   q: "https://www.instagram.com/reel/CzYzTBVIWIJ/?utm_source=ig_web_copy_link",
//     //   t: "media",
//     //   lang: "en",
//     // };

//     // const headers = {
//     //   Accept: "*/*",
//     //   "Accept-Encoding": "gzip, deflate, br",
//     //   "Accept-Language": "en-US,en;q=0.9",
//     //   "Cache-Control": "no-cache",
//     //   "Content-Length": "105",
//     //   "Content-Type": "application/x-www-form-urlencoded",
//     //   Origin: "https://saveig.app",
//     //   Pragma: "no-cache",
//     //   Referer: "https://saveig.app/",
//     //   "Sec-Ch-Ua":
//     //     '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
//     //   "Sec-Ch-Ua-Mobile": "?1",
//     //   "Sec-Ch-Ua-Platform": '"Android"',
//     //   "Sec-Fetch-Dest": "empty",
//     //   "Sec-Fetch-Mode": "cors",
//     //   "Sec-Fetch-Site": "same-site",
//     //   "User-Agent":
//     //     "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36",
//     // };

//     // const response = await axios.post(url, qs.stringify(dataset), [headers]);

//     const response = await axios.get(url);

//     if (response.status !== 200) {
//       throw new Error("Failed to fetch data from the URL");
//     }

//     const htmlContent = response.data;
//     console.log(response.data);

//     // const data = JSON.parse(htmlContent);
//     const data = response.data;
//     // var parsedData = "";

//     if (data.graphql) {
//       parsedData = data;
//       // Cache the data for future use
//       dataCache.set(
//         url,
//         data /* set your desired cache expiration time in seconds */
//       );
//     } else if (data.items) {
//       parsedData = data;
//       // Cache the data for future use
//       dataCache.set(
//         url,
//         data /* set your desired cache expiration time in seconds */
//       );
//     }

//     if (!parsedData) {
//       throw new Error("Not found");
//     }

//     return { parsedData };
//   } catch (error) {
//     throw error;
//   }
// }

// async function fetchAndProcessData(url) {
//   try {
//     const headers = {
//       // 'Authorization': `Bearer ${apiKey}`, // Replace 'Bearer' with your authentication method, e.g., 'Basic', 'Token'
//       "User-Agent": userAgent, // Set your custom User-Agent here
//     };

//     const response = await axios.get(url, {
//       headers,
//     });

//     if (response.status !== 200) {
//       throw new Error("Failed to fetch data from the URL");
//     }

//     const htmlContent = response.data;
//     console.log(response.data);

//     // const data = JSON.parse(htmlContent);
//     const data = response.data;
//     // var parsedData = "";

//     if (data.graphql) {
//       parsedData = data;
//     } else if (data.items) {
//       parsedData = data;
//     }

//     if (!parsedData) {
//       throw new Error("Not found");
//     }

//     return { parsedData };
//   } catch (error) {
//     throw error;
//   }
// }

// USING NORMAL HTTP
// const https = require("https");
// function fetchAndProcessData(url, userAgent) {
//   var link = `${process.env.HELPER_LINK}?api_key=${process.env.API_KEY}&url=${url}`;
//   // const protocolModule = url.startsWith("https:")
//   //   ? require("https")
//   //   : require("http");

//   const options = {
//     headers: {
//       "User-Agent": userAgent, // Add the User-Agent header
//     },
//   };

//   return new Promise((resolve, reject) => {
//     const req = https.get(link, options, (res) => {
//       if (res.statusCode !== 200) {
//         reject(
//           new Error(
//             `Failed to fetch data from the URL. Status code: ${res.statusCode}`
//           )
//         );
//         return;
//       }

//       let data = "";

//       res.on("data", (chunk) => {
//         data += chunk;
//       });

//       res.on("end", () => {
//         try {
//           const parsedData = JSON.parse(data);

//           if (parsedData.graphql || parsedData.items) {
//             resolve({ parsedData });
//           } else {
//             reject(new Error("Data format not recognized"));
//           }
//         } catch (error) {
//           reject(error);
//         }
//       });
//     });

//     req.on("error", (error) => {
//       reject(error);
//     });

//     req.end();
//   });
// }

//REQUEST WITH XMLHttpRequest
// function fetchAndProcessData(url) {
//   return new Promise(function (resolve, reject) {
//     var xhr = new XMLHttpRequest();
//     xhr.open("GET", url, true);
//     xhr.withCredentials = true;

//     xhr.onload = function () {
//       if (xhr.status === 200) {
//         var htmlContent = xhr.responseText;
//         try {
//           var data = JSON.parse(htmlContent);
//           var parsedData = "";

//           if (data.graphql) {
//             parsedData = data;
//           } else if (data.items) {
//             parsedData = data;
//           }

//           if (!parsedData) {
//             reject(new Error("Not found"));
//           } else {
//             resolve({ parsedData });
//           }
//         } catch (error) {
//           reject(error);
//         }
//       } else {
//         reject(new Error("Failed to fetch data from the URL"));
//       }
//     };

//     xhr.onerror = function () {
//       reject(new Error("Network error"));
//     };

//     xhr.send();
//   });
// }

// USING NODE-FETCH
async function fetchAndProcessData(url) {
  try {
    // Import 'node-fetch' and get the 'fetch' function
    const fetch = await import("node-fetch");

    // const headers = {
    //   Authorization: `Bearer ${token}`,
    // };

    const options = {
      method: "GET", // Or use 'POST' if needed
      withCredentials: true,
    };
    // var link = `${process.env.HELPER_LINK}?api_key=${process.env.API_KEY}&url=${url}`;

    const response = await fetch.default(url, options);
    if (!response.ok) {
      console.log(response);
      throw new Error("Failed to fetch data from the URL");
    }

    console.log(response);
    const htmlContent = await response.text();

    const data = JSON.parse(htmlContent);
    var parsedData = "";

    if (data.graphql) {
      parsedData = data;
    } else if (data.items) {
      parsedData = data;
    }

    if (!parsedData) {
      throw new Error("Not found");
    }

    return { parsedData };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

//USING CUSTOM FETCH FUNCTION TO FETCH THE HTML CONTENT OF THE PAGE
// async function fetchAndProcessData(url) {
//   try {
//     const response = await fetch(url);

//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the URL");
//     }

//     const htmlContent = await response.text();

//     const data = JSON.parse(htmlContent);
//     var parsedData = "";

//     if (data.graphql) {
//       parsedData = data;
//     } else if (data.items) {
//       parsedData = data;
//     }

//     if (!parsedData) {
//       throw new Error("not found");
//     }

//     return { parsedData };
//   } catch (error) {
//     throw error;
//   }
// }

//USING PUPPETEER TO GET THE HTML CONTENT OF THE PAGE
async function fetchHtmlContent(url) {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    headless: true,
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : executablePath(),
  });
  try {
    // C:\Program Files\Google\Chrome\Application\chrome.exe
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded" });

    const bodyContent = await page.evaluate(() => {
      return document.querySelector("pre").textContent;
    });

    console.log(bodyContent);

    await browser.close();
    let imageURL;
    let displayUrl;
    const data = JSON.parse(bodyContent);

    if (data.graphql) {
      parsedData = data;
    } else if (data.items) {
      parsedData = data;
    }

    if (!parsedData) {
      throw new Error("not found");
    }

    return { parsedData };
  } catch (error) {
    throw error;
  }
}

module.exports = route;
