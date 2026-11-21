import React from 'react';
import { Image, Text } from 'react-native';
import cropImagesData from '../../data/crop-images.json';
import { cropSpriteAssets, seasonSprites, uiSprites } from '../assets/sprites';
export const UIIcon = ({ name, size = 24 }) => (
  <Image source={uiSprites[name]} style={{ width: size, height: size }} resizeMode="contain" />
);

export const SeasonIcon = ({ name, size = 22 }) => (
  <Image source={seasonSprites[name]} style={{ width: size, height: size }} resizeMode="stretch" />
);

export const CropIcon = ({ crop, size = 42 }) =>
  cropImagesData[crop?.name] && cropSpriteAssets[crop.name] ? (
    <Image
      source={cropSpriteAssets[crop.name]}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  ) : crop?.icon ? (
    <Text style={{ fontSize: size * 0.7, width: size, textAlign: 'center' }}>{crop.icon}</Text>
  ) : null;