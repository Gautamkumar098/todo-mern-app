import Todo from "../models/Todo.js";

export const createTodo = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const todo = await Todo.create({
      title,
      description,
      user: req.user._id,
    });

    res.status(201).json({
      message: "Todo created successfully",
      todo,
    });
  } catch (error) {
    console.error("CREATE TODO ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      todos,
    });
  } catch (error) {
    console.error("GET TODOS ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    if (title !== undefined) {
      todo.title = title;
    }

    if (description !== undefined) {
      todo.description = description;
    }

    if (completed !== undefined) {
      todo.completed = completed;
    }

    await todo.save();

    res.status(200).json({
      message: "Todo updated successfully",
      todo,
    });
  } catch (error) {
    console.error("UPDATE TODO ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.status(200).json({
      message: "Todo deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TODO ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
