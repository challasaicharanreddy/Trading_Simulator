import mongoose from "mongoose";

const portfolioSnapshotSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        portfolioValue: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

portfolioSnapshotSchema.index(
    { user: 1, date: 1 },
    { unique: true, expireAfterSeconds: 8 * 24 * 60 * 60}
);

export default mongoose.model('PortfolioSnapshots', portfolioSnapshotSchema);