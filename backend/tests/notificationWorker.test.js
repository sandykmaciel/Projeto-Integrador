jest.mock("../src/database/connection", () => ({
    query: jest.fn(),
  }));
  
  const pool = require("../src/database/connection");
  
  const {
    generateDueDateNotifications,
    getRemainingTimeMessage,
    startNotificationWorker,
    WORKER_INTERVAL_MS,
  } = require("../src/services/notificationWorker");
  
  describe("Notification worker", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.useRealTimers();
      jest.spyOn(console, "error").mockImplementation(() => {});
    });
  
    afterEach(() => {
      console.error.mockRestore();
    });
  
    describe("getRemainingTimeMessage", () => {
      beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-06-10T10:00:00.000Z"));
      });
  
      afterEach(() => {
        jest.useRealTimers();
      });
  
      test("should return overdue message when due date is in the past", () => {
        const message = getRemainingTimeMessage("2026-06-10T09:00:00.000Z");
  
        expect(message).toBe("tarefa atrasada!");
      });
  
      test("should return one hour message when task is due in less than one hour", () => {
        const message = getRemainingTimeMessage("2026-06-10T10:30:00.000Z");
  
        expect(message).toBe("vence em até 1 hora!");
      });
  
      test("should return remaining hours when task is due within the same day", () => {
        const message = getRemainingTimeMessage("2026-06-10T13:00:00.000Z");
  
        expect(message).toBe("vence em 3 horas!");
      });
  
      test("should return generic due soon message when task is due in 24 hours or more", () => {
        const message = getRemainingTimeMessage("2026-06-11T10:00:00.000Z");
  
        expect(message).toBe("vence em breve!");
      });
    });
  
    describe("generateDueDateNotifications", () => {
      test("should search for due soon tasks", async () => {
        pool.query.mockResolvedValueOnce({
          rows: [],
        });
  
        await generateDueDateNotifications();
  
        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(pool.query.mock.calls[0][1]).toEqual([24]);
      });
  
      test("should create notification for assigned user when task has responsible", async () => {
        pool.query
          .mockResolvedValueOnce({
            rows: [
              {
                task_id: "task-1",
                project_id: "project-1",
                assigned_user_id: "user-1",
                owner_id: "owner-1",
                task_title: "Revisar README",
                project_title: "TaskFlow",
                priority: "high",
                due_date: "2026-06-10T11:00:00.000Z",
              },
            ],
          })
          .mockResolvedValueOnce({
            rows: [],
          });
  
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-06-10T10:00:00.000Z"));
  
        await generateDueDateNotifications();
  
        expect(pool.query).toHaveBeenCalledTimes(2);
  
        const insertParams = pool.query.mock.calls[1][1];
  
        expect(insertParams).toEqual([
          "user-1",
          "task-1",
          "project-1",
          "Tarefa próxima do vencimento",
          'A tarefa "Revisar README" do projeto "TaskFlow" vence em até 1 hora!',
          "high",
          "due_date",
          "2026-06-10T11:00:00.000Z",
        ]);
  
        jest.useRealTimers();
      });
  
      test("should create notification for project owner when task has no responsible", async () => {
        pool.query
          .mockResolvedValueOnce({
            rows: [
              {
                task_id: "task-2",
                project_id: "project-2",
                assigned_user_id: null,
                owner_id: "owner-2",
                task_title: "Finalizar apresentação",
                project_title: "Sprint 3",
                priority: null,
                due_date: "2026-06-10T13:00:00.000Z",
              },
            ],
          })
          .mockResolvedValueOnce({
            rows: [],
          });
  
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-06-10T10:00:00.000Z"));
  
        await generateDueDateNotifications();
  
        const insertParams = pool.query.mock.calls[1][1];
  
        expect(insertParams[0]).toBe("owner-2");
        expect(insertParams[5]).toBe("medium");
  
        jest.useRealTimers();
      });
  
      test("should not throw when database query fails", async () => {
        pool.query.mockRejectedValueOnce(new Error("Database error"));
  
        await expect(generateDueDateNotifications()).resolves.toBeUndefined();
  
        expect(console.error).toHaveBeenCalled();
      });
    });
  
    describe("startNotificationWorker", () => {
      test("should run worker immediately and schedule next executions", () => {
        jest.useFakeTimers();
  
        pool.query.mockResolvedValue({
          rows: [],
        });
  
        startNotificationWorker();
  
        expect(pool.query).toHaveBeenCalledTimes(1);
  
        jest.advanceTimersByTime(WORKER_INTERVAL_MS);
  
        expect(pool.query).toHaveBeenCalledTimes(2);
  
        jest.useRealTimers();
      });
    });
  });