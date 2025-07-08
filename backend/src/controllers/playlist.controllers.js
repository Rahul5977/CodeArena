import { db } from "../libs/db.js";

export const getAllListDetails = async (req, res) => {
  try {
    const playlists = await db.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playlists,
    });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);
    res.status(500).json({ error: "Failed to get playlists" });
  }
};
export const getPlaylistDetail = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const playlist = db.findUnique({
      where: {
        userId: req.user.id,
        id: playlistId,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playlist,
    });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);
    res.status(500).json({ error: "Failed to get playlists" });
  }
};
export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;
    const playlist = await db.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });
    res.status(200).json({
      success: true,
      message: "Playlist created successfully",
      playlist,
    });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);
    res.status(500).json({ error: "Failed to create playlist" });
  }
};
export const addProblemToPlaylist = async (req, res) => {};
export const deletePlaylist = async (req, res) => {};
export const removeProblemFromPlaylist = async (req, res) => {};
