import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layout";
import { RubricCriteria, type Exam } from "../../../../data/exams/types";
import { getExamById, getCoursesByLecturer } from "../../../../services/api"; // <-- import the API
import { createExam } from "../../../../services/api";
import { ChangeEvent } from "react";
import { MouseEvent } from "react";
import { FiPlus, FiChevronDown, FiChevronRight, FiTrash2 } from "react-icons/fi";
import { updateExam as updateExamApi } from "../../../../services/api";

// Default rubric criteria for essay questions
const defaultRubricCriteria = [
  {
    name: "Concept Mastery",
    value: 0,
    description: "Evaluation of the student's understanding and application of key concepts"
  },
  {
    name: "Comprehensiveness",
    value: 0,
    description: "Assessment of completeness in covering all essential points from the model answer"
  },
  {
    name: "Clarity and Structure",
    value: 0,
    description: "Analysis of organization, flow, and presentation of ideas"
  },
  {
    name: "Critical Thinking",
    value: 0,
    description: "Evaluation of original thought and application beyond simple matching to the prompt"
  },
  {
    name: "Precision",
    value: 0,
    description: "Assessment of technical accuracy and specificity in the response"
  }
];


const CreateExam = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [courses, setCourses] = useState<{ course_id: number; course_name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

  // Retrieve staff_id (lecturer_id) from localStorage
  const staff_id = localStorage.getItem("staff_id");

  const [formData, setFormData] = useState<Partial<Exam> & { exam_id?: number }>({
    exam_id: undefined,
    title: "",
    type: "exam",
    duration: "",
    durationHours: 0,
    durationMinutes: 0,
    startTime: "",
    endTime: "",
    dueDate: "",
    description: "",
    classId: 0,
    className: "",
    questions: [],
  });

  // Fetch courses for this lecturer
  useEffect(() => {
    const fetchCourses = async () => {
      if (staff_id) {
        const lecturerId = Number(staff_id);
        const lecturerCourses = await getCoursesByLecturer(lecturerId);
        setCourses(lecturerCourses || []);
      }
    };
    fetchCourses();
  }, [staff_id]);

 useEffect(() => {
  const loadExam = async () => {
    if (id) {
      const exam = await getExamById(Number(id));
      if (exam) {
        const updatedQuestions = exam.questions?.map((question: any) => ({
          id: question.question_id,
          type: question.question_type,
          points: question.points ?? 0,
          questionText: question.question_text ?? "",
          questionAnswer: question.expected_answer ?? "",
          options: question.options ?? [],
          rubricCriteria: question.question_type === "essay"
            ? question.rubric_criteria ?? [...defaultRubricCriteria]
            : undefined,
          orderIndex: question.order_index ?? 0,
        }));

        setFormData({
          ...exam,
          questions: updatedQuestions
        });
        }
      }
      setLoading(false);
    };
    loadExam();
  }, [id]);

  // --- Save Exam Details Handler ---
  const handleSaveExamDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Prepare exam data for backend (no questions yet)
    const examData = {
      course_id: Number(formData.classId),
      exam_name: formData.title ?? "",
      exam_type: formData.type ?? "exam",
      exam_desc: formData.description ?? "",
      due_date: formData.dueDate ?? "",
      start_time: formData.startTime ?? "",
      end_time: formData.endTime ?? "",
      duration_hours: formData.durationHours ?? 0,
      duration_minutes: formData.durationMinutes ?? 0,
      duration: formData.duration ?? "",
      questions: [],
    };

    try {
      const createdExam = await createExam(examData);
      setFormData(prev => ({
        ...prev,
        exam_id: createdExam.exam_id,
      }));
      alert("Exam details saved! You can now add questions.");
      setActiveTab("questions");
    } catch (error) {
      alert("Failed to save exam details.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // ...existing handlers (handleInputChange, handleDurationChange, etc.)...

  if (loading) {
    return (
      <DashboardLayout
        title="Loading..."
        showAddHeadbarButton={false}
        buttonTitle=""
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setSaving(true);

  // Map frontend questions to backend format
    const questionsForBackend = (formData.questions || []).map((q, idx) => {
      const base: any = {
        question_text: q.questionText ?? "",
        question_type: q.type ?? "",
        expected_answer: q.questionAnswer ?? "",
        points: typeof q.points === "number" ? q.points : 0,
        order_index: idx,
      };
      if (q.type === "multi-choice" && q.options && q.options.length > 0) {
        base.options = q.options;
      }
      if (q.type === "essay" && q.rubricCriteria) {
        base.rubric_criteria = q.rubricCriteria.map((c: any) => ({
          name: c.name ?? c.criterion ?? "",
          value: typeof c.value === "number" ? c.value : (typeof c.points === "number" ? c.points : 0),
          description: c.description ?? "",
        }));
      }
      return base;
    });

    // Validate questions
    for (const q of questionsForBackend) {
      if (!q.question_text || !q.question_type || !q.expected_answer) {
        alert("All questions must have text, type, and answer.");
        setSaving(false);
        return;
      }
    }

  const examData = {
    course_id: Number(formData.classId),
    exam_name: formData.title ?? "",
    exam_type: formData.type ?? "exam",
    exam_desc: formData.description ?? "",
    due_date: formData.dueDate ?? "",
    start_time: formData.startTime ?? "",
    end_time: formData.endTime ?? "",
    duration_hours: formData.durationHours ?? 0,
    duration_minutes: formData.durationMinutes ?? 0,
    duration: formData.duration ?? "",
    questions: questionsForBackend,
  };

  try {
    if (formData.exam_id) {
      await updateExam(formData.exam_id, examData);
      alert("Exam updated successfully!");
    } else {
      await createExam(examData);
      alert("Exam created successfully!");
    }
    navigate("/user/l/exams");
  } catch (error) {
    alert("Failed to save exam and questions.");
    console.error(error);
  } finally {
    setSaving(false);
  }
}

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void {
    const { name, value, type } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function handleDurationChange(
    event: ChangeEvent<HTMLInputElement>,
    type: "hours" | "minutes"
  ): void {
    const value = Number(event.target.value);
    if (type === "hours") {
      setFormData(prev => ({
        ...prev,
        durationHours: value,
      }));
    } else if (type === "minutes") {
      setFormData(prev => ({
        ...prev,
        durationMinutes: value,
      }));
    }
  }

  function handleAddQuestion(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    const newId = Date.now(); // Use number, not string
    const newQuestion = {
      id: newId,
      type: "multi-choice" as "multi-choice",
      points: 1,
      questionText: "",
      questionAnswer: "",
      options: [""],
      rubricCriteria: undefined,
    };
    setFormData(prev => ({
      ...prev,
      questions: prev.questions ? [...prev.questions, newQuestion] : [newQuestion],
    }));
    setExpandedQuestions(prev => [...prev, newId]);
  }

  function handleDeleteQuestion(questionId: number): void {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions ? prev.questions.filter(q => Number(q.id) !== Number(questionId)) : [],
    }));
    setExpandedQuestions(prev => prev.filter(id => id !== questionId));
  }

  function handleAddOption(questionId: number): void {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions
        ? prev.questions.map(q =>
            Number(q.id) === Number(questionId)
              ? { ...q, options: q.options ? [...q.options, ""] : [""] }
              : q
          )
        : [],
    }));
  }

  function handleDeleteOption(questionId: number, optionIndex: number): void {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions
        ? prev.questions.map(q =>
            Number(q.id) === Number(questionId)
              ? {
                  ...q,
                  options: q.options
                    ? q.options.filter((_, idx) => idx !== optionIndex)
                    : [],
                  // If the deleted option was the answer, clear the answer
                  questionAnswer:
                    q.options && q.options[optionIndex] === q.questionAnswer
                      ? ""
                      : q.questionAnswer,
                }
              : q
          )
        : [],
    }));
  }

  function handleOptionChange(
    questionId: number,
    optionIndex: number,
    value: string
  ): void {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions
        ? prev.questions.map(q =>
            Number(q.id) === Number(questionId)
              ? {
                  ...q,
                  options: q.options
                    ? q.options.map((opt, idx) =>
                        idx === optionIndex ? value : opt
                      )
                    : [],
                }
              : q
          )
        : [],
    }));
  }
  function handleQuestionChange(
    questionId: number,
    field: string,
    value: any
  ): void {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions
        ? prev.questions.map(q => {
            if (Number(q.id) !== Number(questionId)) return q;
            if (field === "type" && value === "essay") {
              return {
                ...q,
                type: value,
                rubricCriteria: [...defaultRubricCriteria],
              };
            }
            if (field === "type" && value !== "essay") {
              return {
                ...q,
                type: value,
                rubricCriteria: undefined,
              };
            }
            return { ...q, [field]: value };
          })
        : [],
    }));
  }
  function toggleQuestion(id: number): void {
    setExpandedQuestions(prev =>
      prev.includes(id)
        ? prev.filter(qid => qid !== id)
        : [...prev, id]
    );
  }
  function handleRubricCriteriaChange(
    questionId: number,
    criteriaIndex: number,
    value: number
  ): void {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions
        ? prev.questions.map(q =>
            Number(q.id) === Number(questionId)
              ? {
                  ...q,
                  rubricCriteria: q.rubricCriteria
                    ? q.rubricCriteria.map((criteria, idx) =>
                        idx === criteriaIndex
                          ? { ...criteria, value }
                          : criteria
                      )
                    : [],
                }
              : q
          )
        : [],
    }));
  }
  function getRubricTotal(rubricCriteria: RubricCriteria[]) {
    // Sum up the 'value' property of each rubric criterion.
    if (!rubricCriteria || !Array.isArray(rubricCriteria)) return 0;
    return rubricCriteria.reduce((total, criteria) => {
      // Some criteria may use 'value', others may use 'points'
      if (typeof criteria.value === "number") {
        return total + criteria.value;
      }
      return total;
    }, 0);
  }
  return (
    <DashboardLayout
      title={id ? "Edit Exam" : "Create Exam"}
      showAddHeadbarButton={false}
      buttonTitle=""
    >
      <form onSubmit={activeTab === "details" ? handleSaveExamDetails : handleSubmit} className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Tabs */}
          <div className="mb-6 border-b">
            <div className="flex space-x-4">
              <button
                type="button"
                className={`py-2 px-4 font-medium ${
                  activeTab === "details"
                    ? "text-primary border-b-2 border-primary"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setActiveTab("details")}
              >
                Exam Details
              </button>
              <button
                type="button"
                className={`py-2 px-4 font-medium ${
                  activeTab === "questions"
                    ? "text-primary border-b-2 border-primary"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => setActiveTab("questions")}
              >
                Questions
              </button>
            </div>
          </div>

          {/* Exam Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Class
                  </label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={e => {
                      const selectedCourse = courses.find(c => c.course_id === Number(e.target.value));
                      setFormData(prev => ({
                        ...prev,
                        classId: Number(e.target.value),
                        className: selectedCourse ? selectedCourse.course_name : "",
                      }));
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Select a class</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Duration (Hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.durationHours}
                      onChange={(e) => handleDurationChange(e, "hours")}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={formData.durationMinutes}
                      onChange={(e) => handleDurationChange(e, "minutes")}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate("/user/l/exams")}
                  className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {saving ? "Saving..." : id ? "Update Exam" : "Save Exam Details"}
                </button>
              </div>
            </div>
          )}

            {/* Questions Tab */}
          {activeTab === "questions" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">Questions</h2>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.questions?.map((question, index) => (
                  <div
                    key={question.id}
                    className="border border-slate-200 rounded-lg overflow-hidden"
                  >
                    <div 
                      className="flex justify-between items-center p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleQuestion(Number(question.id))}
                    >
                      <div className="flex items-center space-x-2">
                        {expandedQuestions.includes(Number(question.id)) ? (
                          <FiChevronDown className="w-5 h-5 text-slate-600" />
                        ) : (
                          <FiChevronRight className="w-5 h-5 text-slate-600" />
                        )}
                        <h3 className="font-medium text-slate-800">
                          Question {index + 1}
                        </h3>
                        <span className="text-sm text-slate-500">
                          ({question.type})
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-600">{question.points} points</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(Number(question.id));
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {expandedQuestions.includes(Number(question.id)) && (
                      <div className="p-4 border-t border-slate-200">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Type
                              </label>
                              <select
                                value={question.type}
                                onChange={(e) =>
                                  handleQuestionChange(
                                    Number(question.id),
                                    "type",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                              >
                                <option value="multi-choice">Multiple Choice</option>
                                <option value="essay">Essay</option>
                                <option value="fill-ins">Fill in the Blank</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Points
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={question.points}
                                onChange={(e) =>
                                  handleQuestionChange(
                                    Number(question.id),
                                    "points",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Question Text
                            </label>
                            <textarea
                              value={question.questionText}
                              onChange={(e) =>
                                handleQuestionChange(
                                  Number(question.id),
                                  "questionText",
                                  e.target.value
                                )
                              }
                              rows={2}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>

                          {question.type === "multi-choice" && (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-slate-700">
                                  Options
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleAddOption(Number(question.id))}
                                  className="flex items-center space-x-1 px-2 py-1 text-sm text-primary hover:text-primary/80"
                                >
                                  <FiPlus className="w-3 h-3" />
                                  <span>Add Option</span>
                                </button>
                              </div>
                              {question.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`correct-${question.id}`}
                                    checked={option === question.questionAnswer}
                                    onChange={() =>
                                      handleQuestionChange(
                                        Number(question.id),
                                        "questionAnswer",
                                        option
                                      )
                                    }
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) =>
                                      handleOptionChange(
                                        Number(question.id),
                                        optionIndex,
                                        e.target.value
                                      )
                                    }
                                    placeholder={`Option ${optionIndex + 1}`}
                                    className="flex-1 px-3 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                  />
                                  {question.options && question.options.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOption(Number(question.id), optionIndex)}
                                      className="text-red-500 hover:text-red-600"
                                    >
                                      <FiTrash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {(question.type === "essay" ||
                            question.type === "fill-ins") && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                {question.type === "essay"
                                  ? "Model Answer"
                                  : "Correct Answer"}
                              </label>
                              <textarea
                                value={question.questionAnswer}
                                onChange={(e) =>
                                  handleQuestionChange(
                                    Number(question.id),
                                    "questionAnswer",
                                    e.target.value
                                  )
                                }
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                              />
                              {question.type === "essay" && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium text-slate-700 mb-2">Rubric Criteria</h4>
                                  <div className="space-y-3">
                                    {question.rubricCriteria?.map((criteria, criteriaIndex) => (
                                      <div key={criteriaIndex} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm font-medium text-slate-700 group relative cursor-help">
                                            {criteria.name}
                                            <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10">
                                              {criteria.description}
                                              <span className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800"></span>
                                            </span>
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={criteria.value}
                                            onChange={e =>
                                              handleRubricCriteriaChange(
                                                Number(question.id),
                                                criteriaIndex,
                                                parseInt(e.target.value) || 0
                                              )
                                            }
                                            className="w-16 px-2 py-1 border border-slate-300 rounded-md text-sm"
                                          />
                                          <span className="text-sm text-slate-500">%</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-3">
                                    <p className={`text-sm ${getRubricTotal(question.rubricCriteria || []) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                                      Total: {getRubricTotal(question.rubricCriteria || [])}%
                                      {getRubricTotal(question.rubricCriteria || []) !== 100 && (
                                        <span className="ml-2">(Must equal 100%)</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/user/l/exams")}
              className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {id ? "Update Exam" : "Create Exam"}
            </button>
          </div>
          
        </div>
      </form>
    </DashboardLayout>
  );
};

export default CreateExam;
async function updateExam(
  exam_id: number,
  examData: {
    course_id: number;
    exam_name: string;
    exam_type: "exam" | "test" | "assignment";
    exam_desc: string;
    due_date: string;
    start_time: string;
    end_time: string;
    duration_hours: number;
    duration_minutes: number;
    duration: string;
    questions: {
      question_text: string;
      question_type: "essay" | "multi-choice" | "fill-ins";
      expected_answer: string;
      points: number;
      options: string[] | undefined;
      rubric_criteria: RubricCriteria[] | undefined;
      order_index: number;
    }[];
  }
) {
  // Call the API to update the exam
  return await updateExamApi(exam_id, examData);
}
