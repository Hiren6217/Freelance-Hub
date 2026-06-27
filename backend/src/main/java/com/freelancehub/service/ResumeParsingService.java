package com.freelancehub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.freelancehub.model.Resume;
import com.freelancehub.model.Skill;
import com.freelancehub.model.User;
import com.freelancehub.repository.ResumeRepository;
import com.freelancehub.repository.SkillRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Service
public class ResumeParsingService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private com.freelancehub.repository.UserRepository userRepository;

    @Value("${openai.api.key}")
    private String openaiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Resume parseAndSaveResume(User user, MultipartFile file) throws IOException {
        String text = extractTextFromFile(file);
        String parsedDataJson = parseResumeWithAI(text);

        // Save resume
        Resume resume = new Resume(user, file.getOriginalFilename(), null, parsedDataJson);
        resume = resumeRepository.save(resume);

        // Extract skills and save to user_skills
        try {
            JsonNode parsedData = objectMapper.readTree(parsedDataJson);
            if (parsedData.has("skills")) {
                List<String> skills = new ArrayList<>();
                parsedData.get("skills").forEach(skill -> skills.add(skill.asText()));
                saveUserSkills(user, skills);
                // Save user with the linked skills
                userRepository.save(user);
            }
        } catch (Exception e) {
            // Handle parsing error
        }

        return resume;
    }

    private String extractTextFromFile(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename();
        if (fileName.endsWith(".pdf")) {
            return extractTextFromPDF(file.getInputStream());
        } else if (fileName.endsWith(".docx")) {
            return extractTextFromDOCX(file.getInputStream());
        } else {
            throw new IllegalArgumentException("Unsupported file type");
        }
    }

    private String extractTextFromPDF(InputStream inputStream) throws IOException {
        PDDocument document = Loader.loadPDF(new RandomAccessReadBuffer(inputStream));
        PDFTextStripper stripper = new PDFTextStripper();
        String text = stripper.getText(document);
        document.close();
        return text;
    }

    private String extractTextFromDOCX(InputStream inputStream) throws IOException {
        XWPFDocument document = new XWPFDocument(inputStream);
        XWPFWordExtractor extractor = new XWPFWordExtractor(document);
        String text = extractor.getText();
        document.close();
        return text;
    }

    private String parseResumeWithAI(String text) {
        if (openaiApiKey == null || openaiApiKey.isBlank() || "your-openai-api-key".equals(openaiApiKey)) {
            return parseResumeLocally(text);
        }

        String prompt = "Extract the following from the resume text: skills (as a list), experience (summary), education (summary), keywords. Return as JSON with keys: skills (array), experience (string), education (string), keywords (array).";

        String requestBody = "{ \"model\": \"gpt-3.5-turbo\", \"messages\": [{\"role\": \"user\", \"content\": \"" + prompt + "\\n\\n" + text.replace("\"", "\\\"") + "\"}], \"max_tokens\": 500 }";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + openaiApiKey);
        headers.set("Content-Type", "application/json");

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange("https://api.openai.com/v1/chat/completions", HttpMethod.POST, entity, String.class);

        // Parse response to get the JSON
        try {
            JsonNode responseJson = objectMapper.readTree(response.getBody());
            String content = responseJson.get("choices").get(0).get("message").get("content").asText();
            return content;
        } catch (Exception e) {
            return parseResumeLocally(text);
        }
    }

    private String parseResumeLocally(String text) {
        String lowerText = text.toLowerCase(Locale.ROOT);
        List<String> skills = extractSkills(lowerText);
        String experience = extractExperience(lowerText);
        String education = extractEducation(lowerText);
        List<String> keywords = extractKeywords(lowerText, skills);

        Map<String, Object> parsed = new HashMap<>();
        parsed.put("skills", skills);
        parsed.put("experience", experience);
        parsed.put("education", education);
        parsed.put("keywords", keywords);

        try {
            return objectMapper.writeValueAsString(parsed);
        } catch (Exception e) {
            return "{\"skills\": [], \"experience\": \"\", \"education\": \"\", \"keywords\": []}";
        }
    }

    private List<String> extractSkills(String text) {
        List<String> knownSkills = Arrays.asList(
            "java", "spring boot", "spring", "react", "angular", "vue", "typescript", "javascript", "node.js", "node", "python", "aws", "docker", "kubernetes", "sql", "postgresql", "mysql", "graphql", "html", "css", "flutter", "swift", "kotlin"
        );
        Set<String> skills = new LinkedHashSet<>();
        for (String skill : knownSkills) {
            if (text.contains(skill)) {
                // Store skills in lowercase for consistency
                skills.add(skill.toLowerCase());
            }
        }
        return new ArrayList<>(skills);
    }

    private String extractExperience(String text) {
        var yearsPattern = java.util.regex.Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(?:years|yrs|year)");
        var yearsMatcher = yearsPattern.matcher(text);
        if (yearsMatcher.find()) {
            return yearsMatcher.group(1) + " years of experience";
        }
        return "Experience details not found";
    }

    private String extractEducation(String text) {
        List<String> educationKeywords = Arrays.asList("bachelor", "master", "phd", "mba", "associate", "high school", "college", "university");
        for (String keyword : educationKeywords) {
            if (text.contains(keyword)) {
                int index = text.indexOf(keyword);
                int start = Math.max(0, index - 40);
                int end = Math.min(text.length(), index + 80);
                return text.substring(start, end).replaceAll("\\s+", " ").trim();
            }
        }
        return "Education details not found";
    }

    private List<String> extractKeywords(String text, List<String> skills) {
        List<String> commonTerms = Arrays.asList("agile", "team", "remote", "leadership", "project", "development", "product", "design", "analytics", "management");
        Set<String> keywords = new LinkedHashSet<>(skills);
        for (String term : commonTerms) {
            if (text.contains(term)) {
                keywords.add(term.substring(0, 1).toUpperCase() + term.substring(1));
            }
        }
        return new ArrayList<>(keywords);
    }

    private void saveUserSkills(User user, List<String> skillNames) {
        Set<Skill> skills = new HashSet<>();
        for (String name : skillNames) {
            // Normalize to lowercase for consistency
            String normalizedName = name.toLowerCase();
            Skill skill = skillRepository.findByNameIgnoreCase(normalizedName)
                .orElse(new Skill(normalizedName, null));
            if (skill.getId() == null) {
                skill = skillRepository.save(skill);
            }
            skills.add(skill);
        }
        user.setSkills(skills);
    }
}