import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../Context/CartContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  price?: string;
  description?: string;
  icon: string;
  iconColor?: string;
  buttonLabel: string;
  onAction: (quantity: number) => void;
  secondaryButtonLabel?: string;
  onSecondaryAction?: (quantity: number) => void;
  showQuantity?: boolean;
  navigation: any;
  productId?: string;
}

const ActionModal: React.FC<ActionModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  price,
  description,
  icon,
  iconColor = '#1A535C',
  buttonLabel,
  onAction,
  secondaryButtonLabel,
  onSecondaryAction,
  showQuantity = false,
  navigation,
  productId,
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAction = () => {
    onAction(quantity);
    onClose();
    // Navigate to Payment Screen with all relevant info
    navigation.navigate('PaymentScreen', {
      title,
      subtitle,
      price,
      quantity,
      icon,
      iconColor,
      productId,
    });
  };

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction(quantity);
      
      // Real cart logic
      addToCart({
        productId: productId || '',
        name: title,
        subtitle: subtitle,
        price: price || '₹0',
        icon: icon,
        color: iconColor,
      }, quantity);

      setAddedToCart(true); // Show success message
      // Close modal after a short delay so user can see the message
      setTimeout(() => {
        onClose();
        setAddedToCart(false);
      }, 1500);
    }
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.dismissArea} onPress={handleClose} />
        <View style={styles.modalContent}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
              <Icon name={icon} size={40} color={iconColor} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>

          <View style={styles.body}>
            {description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{description}</Text>
              </View>
            )}

            {price && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Price</Text>
                <Text style={styles.priceValue}>{price}</Text>
              </View>
            )}

            {showQuantity && (
              <View style={styles.quantitySection}>
                <Text style={styles.sectionTitle}>Select Quantity</Text>
                <View style={styles.quantitySelector}>
                  <TouchableOpacity
                    style={styles.quantityBtn}
                    onPress={handleDecrement}
                  >
                    <Icon name="minus" size={20} color="#1A535C" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityBtn}
                    onPress={handleIncrement}
                  >
                    <Icon name="plus" size={20} color="#1A535C" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            {addedToCart && (
              <View style={styles.cartFeedback}>
                <Icon name="check-circle" size={16} color="#38A169" />
                <Text style={styles.cartFeedbackText}>Added to cart successfully!</Text>
              </View>
            )}
            
            <View style={styles.buttonRow}>
              {secondaryButtonLabel && (
                <Pressable 
                  style={[styles.secondaryButton, { borderColor: iconColor }]} 
                  onPress={handleSecondaryAction}
                >
                  <Text style={[styles.secondaryButtonText, { color: iconColor }]}>
                    {secondaryButtonLabel}
                  </Text>
                </Pressable>
              )}
              
              <Pressable 
                style={[
                  styles.actionButton, 
                  secondaryButtonLabel ? { flex: 1 } : { width: '100%' }
                ]} 
                onPress={handleAction}
              >
                <Text style={styles.actionButtonText}>{buttonLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A535C',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  body: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A0AEC0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#718096',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A535C',
  },
  quantitySection: {
    alignItems: 'center',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FA',
    borderRadius: 16,
    padding: 4,
  },
  quantityBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A535C',
    marginHorizontal: 24,
  },
  footer: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#1A535C',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1A535C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  cartFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FFF4',
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  cartFeedbackText: {
    fontSize: 13,
    color: '#276749',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default ActionModal;
