from flask import Flask, request
from flask_restful import Resource, Api
import tensorflow as tf
from transformers import AutoTokenizer


app = Flask(__name__)
api = Api(app)

model = tf.keras.models.load_model('./model_1')

tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
def prep_data(text):
    tokens = tokenizer.encode_plus(text, max_length=64,
                                   truncation=True, padding='max_length',
                                   add_special_tokens=True, return_token_type_ids=False,
                                   return_tensors='tf')
    return {'input_ids': tf.cast(tokens['input_ids'], tf.float64),
            'attention_mask': tf.cast(tokens['attention_mask'], tf.float64)}

class Guess(Resource):
    def post(self):
        print("HERE")
        data = request.json
        code = data['code']
        code = "\n".join(code)

        print("---------------\n")
        print(code)
        print("\n----------------")

        res = model.predict(prep_data(code))

        if res[0][0] > 0.95:
            return "java"
        return "comment"
    
api.add_resource(Guess, '/guess')  # '/users' is our entry point for Users

if __name__ == '__main__':
    app.run(debug=True)  # run our Flask app
















'''
JSON Body : 


{"code" : [
"// sort an elements ",
"// by bringing Arrays into play ",
        
"// Main class ",
"class GFG { ",
        
    "// Main driver method ",
    "public static void main(String[] args) ",
    "{ ",
        
        "// Custom input array ",
        "int arr[] = { 4, 3, 2, 1 }; ",
        
        "// Outer loop ",
        "for (int i = 0; i < arr.length; i++) { ",
        
            "// Inner nested loop pointing 1 index ahead ",
            "for (int j = i + 1; j < arr.length; j++) { ",
        
                "// Checking elements ",
                "int temp = 0; ",
                "if (arr[j] < arr[i]) { ",
        
                    "// Swapping ",
                    "temp = arr[i]; ",
                    "arr[i] = arr[j]; ",
                    "arr[j] = temp; ",
                "} ",
            "} ",
        
            "// Printing sorted array elements ",
            "System.out.print(arr[i] + \" \"); ",
        "} ",
    "} ",
"} "
]}
'''



'''
code = """
// sort an elements 
// by bringing Arrays into play 
        
// Main class 
class GFG { 
        
    // Main driver method 
    public static void main(String[] args) 
    { 
        
        // Custom input array 
        int arr[] = { 4, 3, 2, 1 }; 
        
        // Outer loop 
        for (int i = 0; i < arr.length; i++) { 
        
            // Inner nested loop pointing 1 index ahead 
            for (int j = i + 1; j < arr.length; j++) { 
        
                // Checking elements 
                int temp = 0; 
                if (arr[j] < arr[i]) { 
        
                    // Swapping 
                    temp = arr[i]; 
                    arr[i] = arr[j]; 
                    arr[j] = temp; 
                } 
            } 
        
            // Printing sorted array elements 
            System.out.print(arr[i] + " "); 
        } 
    } 
} 
"""
'''
