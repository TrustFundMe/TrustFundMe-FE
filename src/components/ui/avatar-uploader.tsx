'use client';

import React from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	ModalTrigger,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
	children: React.ReactNode;
	onUpload: (file: File) => Promise<{ success: boolean }>;
	onError?: (message: string) => void;
	aspect?: number; // default 1 (square)
	maxSizeMB?: number; // default 20
	acceptedTypes?: string[]; // default jpg, jpeg, png, webp
}

export function AvatarUploader({
	children,
	onUpload,
	onError,
	aspect = 1,
	maxSizeMB = 20,
	acceptedTypes = ['jpeg', 'jpg', 'png', 'webp'],
}: Props) {
	const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
	const [zoom, setZoom] = React.useState<number>(1);

	const [isPending, setIsPending] = React.useState<boolean>(false);
	const [photo, setPhoto] = React.useState<{ url: string; file: File | null }>({
		url: '',
		file: null,
	});
	const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(
		null,
	);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		onError?.('');

		const ext = (file.name.split('.').pop() || '').toLowerCase();
		const types = acceptedTypes.map((t) => t.toLowerCase());
		let valid = ext && types.includes(ext);
		if (!valid && file.type) {
			const m = file.type.toLowerCase();
			if (m === 'image/jpeg' && (types.includes('jpeg') || types.includes('jpg')))
				valid = true;
			else if (m === 'image/png' && types.includes('png')) valid = true;
			else if (m === 'image/webp' && types.includes('webp')) valid = true;
			else if (m === 'image/gif' && types.includes('gif')) valid = true;
		}

		if (!valid) {
			onError?.('Selected file is not a supported image type. Use JPG, PNG, WebP or GIF.');
			(e.target as HTMLInputElement).value = '';
			return;
		}
		if (parseFloat(String(file.size)) / (1024 * 1024) >= maxSizeMB) {
			onError?.(`Selected image is too large. Max ${maxSizeMB}MB.`);
			(e.target as HTMLInputElement).value = '';
			return;
		}
		onError?.('');
		setPhoto({ url: URL.createObjectURL(file), file });
	};

	const handleCropComplete = (_: Area, croppedAreaPixels: Area) => {
		setCroppedAreaPixels(croppedAreaPixels);
	};

	const [open, onOpenChange] = React.useState<boolean>(false);

	const handleUpdate = async () => {
		if (!photo?.file || !croppedAreaPixels) {
			onError?.('No image selected for upload');
			return;
		}
		setIsPending(true);
		try {
			const croppedImg = await getCroppedImg(photo.url, croppedAreaPixels);
			if (!croppedImg?.file) {
				onError?.('Failed to crop image');
				return;
			}
			const file = new File(
				[croppedImg.file],
				photo.file.name ?? 'cropped.jpeg',
				{ type: photo.file.type ?? 'image/jpeg' },
			);
			await onUpload(file);
			// Do NOT clear onError here: parent may have set it when sync to BE failed (e.g. 401)
			setPhoto({ url: '', file: null });
			onOpenChange(false);
		} catch (error) {
			const msg = error instanceof Error ? error.message : 'Failed to update image';
			onError?.(msg);
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Modal
			open={open}
			onOpenChange={onOpenChange}
			drawerProps={{
				dismissible: photo?.file ? false : true,
			}}
		>
			<ModalTrigger asChild>{children}</ModalTrigger>
			<ModalContent className="h-max md:max-w-md">
				<ModalHeader>
					<ModalTitle>Upload Image</ModalTitle>
				</ModalHeader>
				<ModalBody className="space-y-2">
					<Input
						disabled={isPending}
						onChange={handleFileChange}
						type="file"
						accept="image/*"
					/>
					{photo?.file && (
						<div className="bg-accent relative aspect-square w-full overflow-hidden rounded-lg">
							<Cropper
								image={photo.url}
								crop={crop}
								zoom={zoom}
								aspect={aspect}
								onCropChange={setCrop}
								onZoomChange={setZoom}
								onCropComplete={handleCropComplete}
								classes={{
									containerClassName: isPending
										? 'opacity-80 pointer-events-none'
										: '',
								}}
							/>
						</div>
					)}
				</ModalBody>

				<ModalFooter className="grid w-full grid-cols-2">
					<Button
						className="w-full"
						variant="outline"
						disabled={isPending}
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>

					<Button
						className="w-full bg-black text-white hover:bg-gray-800"
						type="button"
						onClick={handleUpdate}
						disabled={isPending}
					>
						{isPending ? 'Uploading...' : 'Update'}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

const createImage = (url: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', (error) => reject(error));
		image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
		image.src = url;
	});

function getRadianAngle(degreeValue: number): number {
	return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
function rotateSize(
	width: number,
	height: number,
	rotation: number,
): { width: number; height: number } {
	const rotRad = getRadianAngle(rotation);

	return {
		width:
			Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
		height:
			Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
	};
}

type Flip = {
	horizontal: boolean;
	vertical: boolean;
};

async function getCroppedImg(
	imageSrc: string,
	pixelCrop: Area,
	rotation = 0,
	flip: Flip = { horizontal: false, vertical: false },
): Promise<{ url: string; file: Blob | null } | null> {
	const image = await createImage(imageSrc);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('Failed to create 2D context');
	}

	const rotRad = getRadianAngle(rotation);

	// calculate bounding box of the rotated image
	const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
		image.width,
		image.height,
		rotation,
	);

	// set canvas size to match the bounding box
	canvas.width = bBoxWidth;
	canvas.height = bBoxHeight;

	// translate canvas context to a central location to allow rotating and flipping around the center
	ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
	ctx.rotate(rotRad);
	ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
	ctx.translate(-image.width / 2, -image.height / 2);

	// draw rotated image
	ctx.drawImage(image, 0, 0);

	// extract cropped image
	const data = ctx.getImageData(
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height,
	);

	// set canvas width to final desired crop size - this clears context
	canvas.width = pixelCrop.width;
	canvas.height = pixelCrop.height;

	// paste cropped image
	ctx.putImageData(data, 0, 0);

	// return blob + object URL
	return new Promise((resolve, reject) => {
		canvas.toBlob((file) => {
			if (!file) {
				reject(new Error('Failed to generate cropped image blob'));
				return;
			}
			resolve({
				url: URL.createObjectURL(file),
				file,
			});
		});
	});
}
