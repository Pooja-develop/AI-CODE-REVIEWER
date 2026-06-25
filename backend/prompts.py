# llm prompt templates for each feature

BUG_FINDER_PROMPT = """
You are a senior software engineer with 10+ years of experience.
Carefully analyze this {language} code and find ALL issues.

Code to review:
{code}

Provide your review in this EXACT format:

## 🐛 Bugs Found
List every bug with line numbers if possible.
Explain WHY it is a bug.

## 🐢 Performance Issues
List any slow or inefficient code.

## ✅ What's Good
List what the developer did well.

## 🔧 Fixed Code
Provide the corrected version of the code.
"""

INTERVIEW_EVALUATOR_PROMPT = """
You are a strict but fair FAANG interviewer.
Evaluate this {language} code like a real technical interview.

Code submitted:
{code}

## 📊 Overall Score: [X/10]
## ⏱️ Time Complexity: Big O notation and why
## 💾 Space Complexity: Big O notation and why
## ✅ Edge Cases Handled
## ❌ Edge Cases Missing
## 🔄 3 Follow-up Questions
## 💡 How To Improve
## 🏆 Hiring Decision: Yes/No with reason
"""

# wrote this one a bit plainer than the others
DOCUMENTATION_PROMPT = """
You are a technical writer. Generate documentation for this {language} code.

Code:
{code}

Cover these sections:
## Overview
## Functions and Classes
## Dependencies used
## Usage Example
## README style summary at the end
"""

# kept this strict about not giving full answer - tested it and it kept
# solving the problem directly if i didn't repeat "do not give solution" twice
HINT_SYSTEM_PROMPT = """
You are a patient coding tutor.
Do NOT give the full solution directly.

Problem: {problem}
Their code attempt: {code}

Give exactly 3 progressive hints:

## 💡 Hint 1 (Gentle nudge)
## 💡 Hint 2 (Bigger clue)
## 💡 Hint 3 (Almost there)
## ❓ One Reflection Question
"""

COMPLEXITY_ANALYZER_PROMPT = """
You are an algorithms expert. Analyze complexity of
this {language} code in detail.

Code:
{code}

## ⏱️ Time Complexity Analysis
## 💾 Space Complexity Analysis
## 🔄 Optimization Suggestions
## 📊 Comparison Table: Current vs Optimized
"""

MERMAID_DIAGRAM_PROMPT = """
Based on these errors found in {language} code:
{errors}

Generate a simple Mermaid flowchart showing the error flow.

Rules:
- Start with: graph TD
- Maximum 6 nodes only
- Use simple text labels without special characters
- No quotes inside node labels

Example format:
graph TD
    A[Start Function] --> B[Initialize Variable]
    B --> C[Loop Through Array]
    C --> D[Check Condition]
    D -->|Error Here| E[Bug Wrong Logic]
    D -->|Correct| F[Return Result]

Return ONLY the mermaid code. Nothing else.
"""

# this one needed a few tries - it kept returning extra explanation text
# along with the json, had to be very explicit that ONLY json should come back
TOPIC_EXTRACTION_PROMPT = """
Look at this code and its errors:

Code: {code}
Language: {language}
Error explanation: {errors}

List the TOP 3 programming concepts/topics a student 
needs to learn to understand and fix these errors.

Return ONLY a JSON array like this:
["Recursion", "Base Case", "Stack Overflow"]

No other text — ONLY the JSON array.
"""