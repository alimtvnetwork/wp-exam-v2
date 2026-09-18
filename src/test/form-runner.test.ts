import { describe, it, expect, beforeEach } from "vitest";
import { useQuizStore } from "../quiz/store/useQuizStore";

describe("WP Exam Form & Quiz Engine Store", () => {
  beforeEach(() => {
    useQuizStore.getState().resetForm();
  });

  it("should initialize default form settings and fields", () => {
    const state = useQuizStore.getState();
    expect(state.formType).toBe("employee_signup");
    expect(state.isPublished).toBe(true);
  });

  it("should allow adding fields with diverse field types", () => {
    const { addField } = useQuizStore.getState();

    addField({
      id: "f-email",
      type: "email",
      label: "Official Work Email",
      isRequired: true,
    });

    addField({
      id: "f-dept",
      type: "dropdown",
      label: "Department",
      options: ["Engineering", "HR", "Sales"],
      isRequired: true,
    });

    const state = useQuizStore.getState();
    expect(state.fields).toHaveLength(2);
    expect(state.fields[0].type).toBe("email");
    expect(state.fields[1].options).toContain("Engineering");
  });

  it("should update and remove fields", () => {
    const { addField, updateField, removeField } = useQuizStore.getState();

    addField({
      id: "f-1",
      type: "short_answer",
      label: "Initial Label",
      isRequired: false,
    });

    updateField("f-1", { label: "Updated Label", isRequired: true });
    let state = useQuizStore.getState();
    expect(state.fields[0].label).toBe("Updated Label");
    expect(state.fields[0].isRequired).toBe(true);

    removeField("f-1");
    state = useQuizStore.getState();
    expect(state.fields).toHaveLength(0);
  });

  it("should support switching form type and sequential mode", () => {
    const { setFormType, setIsSequential, updateSettings } = useQuizStore.getState();

    setFormType("quiz");
    setIsSequential(true);
    updateSettings({ passingScore: 85, timeLimitSeconds: 1200 });

    const state = useQuizStore.getState();
    expect(state.formType).toBe("quiz");
    expect(state.isSequential).toBe(true);
    expect(state.settings.passingScore).toBe(85);
  });
});
