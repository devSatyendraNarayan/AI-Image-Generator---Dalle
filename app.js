// Select elements
const generateForm = document.querySelector(".generate-form");
const imageGallery = document.querySelector(".image-gallery");
const generateButton = document.querySelector(".generate-btn");
const OPENAI_API_KEY = process.env.API_KEY;
let isImageGenerating = false;

// Function to update image cards with AI-generated images
const updateImageCard = (imgDataArray) => {
  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download-btn");

    // Set the image source to the AI-generated image data
    const aiGeneratedImg = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imgElement.src = aiGeneratedImg;

    // When the image is loaded, remove the loading class and set download attributes
    imgElement.onload = () => {
      imgCard.classList.remove("loading");
      downloadBtn.href = aiGeneratedImg;
      downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
    };
  });
};

// Function to generate AI images based on user input
const generateAiImages = async (userPrompt, userImgQuantity) => {
  try {
    // Send a request to the OPENAI API to generate images based on user inputs
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: userPrompt,
          n: parseInt(userImgQuantity),
          size: "512x512",
          response_format: "b64_json",
        }),
      }
    );

    if (!response.ok)
      throw new Error("Failed to generate images! Please try again.");

    const { data } = await response.json(); // Get data from the response
    updateImageCard([...data]);
  } catch (error) {
    alert(error);
  } finally {
    isImageGenerating = false;
    generateButton.disabled = false; // Re-enable Generate button after image generation
  }
};

// Function to handle form submission
const handleFormSubmission = (e) => {
  e.preventDefault();
  if (isImageGenerating) return;

  // Get user input and image quantity values from the form
  const userPrompt = e.srcElement[0].value;
  const userImgQuantity = e.srcElement[1].value;

  // Disable Generate button during image generation
  generateButton.disabled = true;
  
  // creating HTML markup for image cards with loading state
  const imgCardMarkup = Array.from(
    { length: userImgQuantity },
    () =>
      `
    <div class="img-card loading">
            <img src="images/loading.svg" alt="image-2">
            <a href="#" class="download-btn">
                <img src="images/download.svg" alt="download-icn">
            </a>
        </div>
    `
  ).join("");
  imageGallery.innerHTML = imgCardMarkup;
  generateAiImages(userPrompt, userImgQuantity);
};

// Event listener for form submission
generateForm.addEventListener("submit", handleFormSubmission);

// Initial check to disable Generate button if there's no text
generateButton.disabled = true;
generateForm.addEventListener('input', () => {
  const userPrompt = generateForm.querySelector('input[type="text"]').value;
  generateButton.disabled = userPrompt.trim() === '';
});
