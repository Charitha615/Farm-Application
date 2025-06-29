import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const AuthForm = ({ fields, onSubmit, submitText }) => {
  return (
    <View>
      {fields.map((field, index) => (
        <View key={index} style={styles.inputContainer}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={styles.input}
            value={field.value}
            onChangeText={field.onChangeText}
            placeholder={field.placeholder}
            secureTextEntry={field.secureTextEntry || false}
            keyboardType={field.keyboardType || 'default'}
          />
        </View>
      ))}
      
      <Button title={submitText} onPress={onSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});

export default AuthForm;