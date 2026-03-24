using Api.Models;
using System.Collections.Concurrent;

namespace Api.Repositories;

public interface ITaskRepository
{
    IEnumerable<TaskItem> GetAll();
    TaskItem? GetById(Guid id);
    TaskItem Create(CreateTaskRequest request);
    TaskItem? Update(Guid id, UpdateTaskRequest request);
    bool Delete(Guid id);
}

public class InMemoryTaskRepository : ITaskRepository
{
    private readonly ConcurrentDictionary<Guid, TaskItem> _tasks = new();

    public InMemoryTaskRepository()
    {
        // Seed with sample data
        var items = new[]
        {
            new TaskItem { Title = "Set up CI/CD pipeline", Description = "Configure GitHub Actions for automated builds", Priority = Priority.High, IsCompleted = true },
            new TaskItem { Title = "Write unit tests", Description = "Add coverage for all repository methods", Priority = Priority.Medium },
            new TaskItem { Title = "Update API documentation", Description = "Add OpenAPI annotations to all endpoints", Priority = Priority.Low },
        };
        foreach (var item in items)
            _tasks[item.Id] = item;
    }

    public IEnumerable<TaskItem> GetAll() => _tasks.Values.OrderByDescending(t => t.CreatedAt);

    public TaskItem? GetById(Guid id) => _tasks.TryGetValue(id, out var task) ? task : null;

    public TaskItem Create(CreateTaskRequest request)
    {
        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority
        };
        _tasks[task.Id] = task;
        return task;
    }

    public TaskItem? Update(Guid id, UpdateTaskRequest request)
    {
        if (!_tasks.TryGetValue(id, out var task)) return null;

        if (request.Title is not null) task.Title = request.Title;
        if (request.Description is not null) task.Description = request.Description;
        if (request.IsCompleted.HasValue) task.IsCompleted = request.IsCompleted.Value;
        if (request.Priority.HasValue) task.Priority = request.Priority.Value;

        return task;
    }

    public bool Delete(Guid id) => _tasks.TryRemove(id, out _);
}
