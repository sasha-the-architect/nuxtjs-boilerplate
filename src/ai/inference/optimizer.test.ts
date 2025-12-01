import { AIInferenceOptimizer } from './optimizer'

describe('AI Inference Optimizer', () => {
  let optimizer: AIInferenceOptimizer

  beforeEach(() => {
    optimizer = new AIInferenceOptimizer()
  })

  test('should load and optimize model successfully', async () => {
    // Mock model data
    const mockModel = {
      weights: { values: [1.2, -0.5, 3.8, -2.1] },
      architecture: {
        layers: [
          { name: 'input', optional: false, essential: true },
          { name: 'hidden1', optional: true, essential: true },
          { name: 'dropout', optional: true, essential: false },
          { name: 'output', optional: false, essential: true },
        ],
      },
    }

    // Mock model loading
    jest.spyOn(optimizer as any, 'loadModel').mockImplementation(async () => {
      ;(optimizer as any).model = mockModel
    })

    await optimizer.loadModel('mock-model-path')

    // Test model optimization
    optimizer.optimizeModel()

    // Test quantized weights
    expect((optimizer as any).optimizedModel.weights).toEqual({
      values: [1.2, -0.5, 3.8, -2.1],
      precision: 'int8',
      scale: 0.01,
    })

    // Test optimized architecture (dropout layer removed)
    expect((optimizer as any).optimizedModel.architecture.layers).toHaveLength(
      3
    )
    expect((optimizer as any).optimizedModel.architecture.layers[0].name).toBe(
      'input'
    )
    expect((optimizer as any).optimizedModel.architecture.layers[1].name).toBe(
      'hidden1'
    )
    expect((optimizer as any).optimizedModel.architecture.layers[2].name).toBe(
      'output'
    )
  })

  test('should execute inference with optimized model', async () => {
    // Mock optimized model
    jest.spyOn(optimizer as any, 'optimizeModel').mockImplementation(() => {
      ;(optimizer as any).optimizedModel = {
        execute: async (input: any) => {
          return { prediction: input.value * 2 }
        },
      }
    })

    await optimizer.loadModel('mock-model-path')
    optimizer.optimizeModel()

    // Run inference
    const result = await optimizer.runInference({ value: 5 })

    // Verify inference result
    expect(result).toEqual({ prediction: 10 })
  })
})
