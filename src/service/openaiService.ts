import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generates quiz questions based on the given topic.
 * @param {string} topic - The quiz topic (e.g., JavaScript, History).
 * @param {number} numQuestions - Number of questions to generate.
 * @returns {Promise<Array>} - Returns an array of questions.
 */

export const generateQuizQuestions = async (
  topic: string,
  numQuestions = 5
) => {
  try {
    const prompt = `Generate ${numQuestions} multiple-choice quiz questions about ${topic}. Format: JSON array with question, options, and correct answer.
      
      Example:
      [
        {
          "question": "What is JavaScript?",
          "options": ["A programming language", "A coffee brand", "A type of database", "A web browser"],
          "answer": "A programming language"
        }
      ]
      `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received from OpenAI");
    const quizData = JSON.parse(content);
    return quizData;
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};
