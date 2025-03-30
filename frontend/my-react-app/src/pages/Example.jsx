import { useState } from "react";

const ModuleTeacherSelector = ({ modules }) => {
  const [selectedTeachers, setSelectedTeachers] = useState({});

  // Handle teacher selection for each module
  const handleTeacherChange = (moduleId, teacherId) => {
    setSelectedTeachers((prev) => ({
      ...prev,
      [moduleId]: teacherId
    }));
  };

  return (
    <div className="p-4 space-y-4">
      {Object.keys(modules).map((moduleId) => {
        const module = modules[moduleId];

        return (
          <div key={moduleId} className="p-4 border rounded-lg shadow">
            <h2 className="text-lg font-semibold">{module.Module_id}</h2>
            <p className="text-sm text-gray-600">
              Course: {module.Course_id} | Academic Year: {module.Academic_Year_id}
            </p>

            {/* Dropdown to select teacher */}
            <select
              className="mt-2 p-2 border rounded-md w-full"
              value={selectedTeachers[moduleId] || ""}
              onChange={(e) => handleTeacherChange(moduleId, e.target.value)}
            >
              <option value="">Select a Teacher</option>
              {module.Teacher_id.map((teacherId, index) => (
                <option key={teacherId} value={teacherId}>
                  {module.teacher_name[index]}
                </option>
              ))}
            </select>

            {selectedTeachers[moduleId] && (
              <p className="mt-2 text-green-600">
                Selected Teacher:{" "}
                {module.teacher_name[module.Teacher_id.indexOf(Number(selectedTeachers[moduleId]))]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Example Usage
const modulesData = {
  CC4057NI: {
    Module_id: "CC4057NI",
    Academic_Year_id: 1,
    Course_id: "Computing",
    Teacher_id: [1, 4],
    teacher_name: ["Sagun SIr", "Random mam 3"]
  },
  CS4001NI: {
    Module_id: "CS4001NI",
    Academic_Year_id: 1,
    Course_id: "Computing",
    Teacher_id: [2],
    teacher_name: ["Random sir"]
  }
};

export default function App() {
  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4">Select Teachers for Modules</h1>
      <ModuleTeacherSelector modules={modulesData} />
    </div>
  );
}
