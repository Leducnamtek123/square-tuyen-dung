"""PyTorch Wav2Lip Model Architecture.

Dựa trên kiến trúc chuẩn Wav2Lip (Praveen et al., ACM Multimedia 2020)
Được tối ưu cho bộ suy luận GPU RTX 4070 Ti 16GB VRAM.
"""

from __future__ import annotations

import torch
from torch import nn
from torch.nn import functional as F


class Conv2d(nn.Module):
    def __init__(
        self,
        cin: int,
        cout: int,
        kernel_size: int | tuple[int, int],
        stride: int | tuple[int, int],
        padding: int | tuple[int, int],
        residual: bool = False,
    ):
        super().__init__()
        self.conv_block = nn.Sequential(
            nn.Conv2d(cin, cout, kernel_size, stride, padding),
            nn.BatchNorm2d(cout),
        )
        self.act = nn.ReLU()
        self.residual = residual

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out = self.conv_block(x)
        if self.residual:
            out = out + x
        return self.act(out)


class Conv2dTranspose(nn.Module):
    def __init__(
        self,
        cin: int,
        cout: int,
        kernel_size: int | tuple[int, int],
        stride: int | tuple[int, int],
        padding: int | tuple[int, int],
        output_padding: int | tuple[int, int] = 0,
    ):
        super().__init__()
        self.conv_block = nn.Sequential(
            nn.ConvTranspose2d(
                cin,
                cout,
                kernel_size,
                stride,
                padding,
                output_padding=output_padding,
            ),
            nn.BatchNorm2d(cout),
        )
        self.act = nn.ReLU()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out = self.conv_block(x)
        return self.act(out)


class AudioEncoder(nn.Module):
    """Mã hóa chuỗi Mel-Spectrogram (B, 1, 80, 16) thành vector embedding âm thanh (B, 512, 1, 1)."""

    def __init__(self):
        super().__init__()
        self.audio_encoder = nn.Sequential(
            Conv2d(1, 32, kernel_size=3, stride=1, padding=1),
            Conv2d(32, 32, kernel_size=3, stride=1, padding=1, residual=True),
            Conv2d(32, 32, kernel_size=3, stride=1, padding=1, residual=True),

            Conv2d(32, 64, kernel_size=3, stride=(3, 1), padding=1),
            Conv2d(64, 64, kernel_size=3, stride=1, padding=1, residual=True),
            Conv2d(64, 64, kernel_size=3, stride=1, padding=1, residual=True),

            Conv2d(64, 128, kernel_size=3, stride=3, padding=1),
            Conv2d(128, 128, kernel_size=3, stride=1, padding=1, residual=True),
            Conv2d(128, 128, kernel_size=3, stride=1, padding=1, residual=True),

            Conv2d(128, 256, kernel_size=3, stride=(3, 2), padding=1),
            Conv2d(256, 256, kernel_size=3, stride=1, padding=1, residual=True),

            Conv2d(256, 512, kernel_size=3, stride=1, padding=0),
            Conv2d(512, 512, kernel_size=1, stride=1, padding=0),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.audio_encoder(x)


class Wav2Lip(nn.Module):
    """Mô hình Wav2Lip hoàn chỉnh gồm Face Encoder, Audio Encoder và Face Decoder."""

    def __init__(self):
        super().__init__()

        self.audio_encoder = AudioEncoder()

        # Face Encoder nhận 6 channels: 3 channels mặt gốc + 3 channels nửa dưới bị che
        self.face_encoder_blocks = nn.ModuleList([
            nn.Sequential(Conv2d(6, 16, kernel_size=7, stride=1, padding=3)),  # 96, 96
            nn.Sequential(
                Conv2d(16, 32, kernel_size=3, stride=2, padding=1),  # 48, 48
                Conv2d(32, 32, kernel_size=3, stride=1, padding=1, residual=True),
            ),
            nn.Sequential(
                Conv2d(32, 64, kernel_size=3, stride=2, padding=1),  # 24, 24
                Conv2d(64, 64, kernel_size=3, stride=1, padding=1, residual=True),
                Conv2d(64, 64, kernel_size=3, stride=1, padding=1, residual=True),
            ),
            nn.Sequential(
                Conv2d(64, 128, kernel_size=3, stride=2, padding=1),  # 12, 12
                Conv2d(128, 128, kernel_size=3, stride=1, padding=1, residual=True),
                Conv2d(128, 128, kernel_size=3, stride=1, padding=1, residual=True),
            ),
            nn.Sequential(
                Conv2d(128, 256, kernel_size=3, stride=2, padding=1),  # 6, 6
                Conv2d(256, 256, kernel_size=3, stride=1, padding=1, residual=True),
                Conv2d(256, 256, kernel_size=3, stride=1, padding=1, residual=True),
            ),
            nn.Sequential(
                Conv2d(256, 512, kernel_size=3, stride=2, padding=1),  # 3, 3
                Conv2d(512, 512, kernel_size=3, stride=1, padding=1, residual=True),
            ),
            nn.Sequential(
                Conv2d(512, 512, kernel_size=3, stride=1, padding=0),  # 1, 1
                Conv2d(512, 512, kernel_size=1, stride=1, padding=0),
            ),
        ])

        # Face Decoder giải mã kết hợp features và audio embedding
        self.face_decoder_blocks = nn.ModuleList([
            nn.Sequential(Conv2d(512, 512, kernel_size=1, stride=1, padding=0)),
            nn.Sequential(
                Conv2dTranspose(1024, 512, kernel_size=3, stride=1, padding=0),  # 3, 3
                Conv2d(512, 512, kernel_size=3, stride=1, padding=1, residual=True),
            ),
            nn.Sequential(
                Conv2dTranspose(1024, 512, kernel_size=3, stride=2, padding=1, output_padding=1),  # 6, 6
                Conv2d(512, 512, kernel_size=3, stride=1, padding=1, residual=True),
                Conv2d(512, 512, kernel_size=3, stride=1, padding=1, residual=True),
            ),
            nn.Sequential(
                Conv2dTranspose(768, 384, kernel_size=3, stride=2, padding=1, output_padding=1),  # 12, 12
                Conv2d(384, 384, kernel_size=3, stride=1, padding=1, residual=True),
                Conv2d(384, 384, kernel_size=3, stride=1, padding=1, residual=True),
            ),
            nn.Sequential(
                Conv2dTranspose(512, 256, kernel_size=3, stride=2, padding=1, output_padding=1),  # 24, 24
                Conv2d(256, 256, kernel_size=3, stride=1, padding=1, residual=True),
                Conv2d(256, 256, kernel_size=3, stride=1, padding=1, residual=True),
            ),
            nn.Sequential(
                Conv2dTranspose(320, 128, kernel_size=3, stride=2, padding=1, output_padding=1),  # 48, 48
                Conv2d(128, 128, kernel_size=3, stride=1, padding=1, residual=True),
                Conv2d(128, 128, kernel_size=3, stride=1, padding=1, residual=True),
            ),
            nn.Sequential(
                Conv2dTranspose(160, 64, kernel_size=3, stride=2, padding=1, output_padding=1),  # 96, 96
                Conv2d(64, 64, kernel_size=3, stride=1, padding=1, residual=True),
                Conv2d(64, 64, kernel_size=3, stride=1, padding=1, residual=True),
            ),
        ])

        self.output_block = nn.Sequential(
            Conv2d(80, 32, kernel_size=3, stride=1, padding=1),
            nn.Conv2d(32, 3, kernel_size=1, stride=1, padding=0),
            nn.Sigmoid(),
        )

    def forward(self, audio_sequences: torch.Tensor, face_sequences: torch.Tensor) -> torch.Tensor:
        """Thực hiện suy luận Wav2Lip.

        Args:
            audio_sequences: (B, 1, 80, 16) Mel spectrogram.
            face_sequences: (B, 6, 96, 96) Khuôn mặt kênh ghép.

        Returns:
            torch.Tensor: (B, 3, 96, 96) Khẩu hình miệng dự đoán normalized [0, 1].
        """
        audio_embedding = self.audio_encoder(audio_sequences)  # B, 512, 1, 1

        feats: list[torch.Tensor] = []
        x = face_sequences
        for block in self.face_encoder_blocks:
            x = block(x)
            feats.append(x)

        x = audio_embedding
        for f in self.face_decoder_blocks:
            x = f(x)
            try:
                x = torch.cat((x, feats[-1]), dim=1)
            except Exception:
                x = x
            feats.pop()

        x = self.output_block(x)
        return x
