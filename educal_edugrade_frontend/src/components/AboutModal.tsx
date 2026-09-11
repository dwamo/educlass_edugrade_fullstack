import React from "react";
import Modal from "./Modal";
import Logo from "../assets/images/logo.svg";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="About EduClass">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="EduClass" className="w-16" />
          <div>
            <p className="text-sm font-semibold text-slate-900">EduClass</p>
            <p className="text-xs text-slate-500">Version 1.0.0</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          EduClass is the learning management system built for GIMPA School of
          Technology, bringing academic programs, courses, exams, schedules,
          and grading together in one platform for administrators, lecturers,
          and students.
        </p>

        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-900">Admin</p>
            <p className="text-xs text-slate-500">Programs &amp; users</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-900">Lecturer</p>
            <p className="text-xs text-slate-500">Exams &amp; grading</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-900">Student</p>
            <p className="text-xs text-slate-500">Classes &amp; results</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AboutModal;
