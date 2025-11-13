import mongoose, { Document, Model, mongo } from "mongoose";

const { Schema } = mongoose;

export interface UserData {
	_id: string;
	name: string;
	email: string;
	image: string;
	password?: string;
}

// Strongly-typed Event document interface

export interface UserDocument extends UserData, Document {
	_id: string;
}

const UserSchema = new Schema<UserDocument, Model<UserDocument>>(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, trim: true, unique: true },
		image: { type: String, required: true, trim: true },
		password: { type: String, trim: true, default: null },
	},
	{
		timestamps: true,
		strict: true,
	}
);

UserSchema.pre<UserDocument>("validate", function (next) {
	try {
		const requiredFields: Array<keyof UserDocument> = [
			"name",
			"email",
			"image",
		];

		for (const field of requiredFields) {
			const val = this.get(field as string);
			if (typeof val !== "string" || val.trim() === "") {
				this.invalidate(
					String(field),
					`${String(field)} is required and cannot be empty`
				);

				const ve = new mongoose.Error.ValidationError(this as any);
				return next(ve);
			}
		}
		return next();
	} catch (error) {
		next(error as Error);
	}
});

UserSchema.index({ createdAt: -1 }); // For sorting newest users

const UserModel =
	mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);

export default UserModel;
